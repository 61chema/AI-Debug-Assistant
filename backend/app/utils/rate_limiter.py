"""
Rate limiter, in-memory sliding window implementation.

Protects the AI endpoints from excessive usage that would drain the
Anthropic API budget. Tracks requests per IP address using two windows:

  - Per minute : blocks burst attacks (e.g. a script firing 100 requests)
  - Per day    : blocks sustained abuse across multiple minutes

How it works (sliding window):
  Each request timestamp is stored in a list per IP.
  Before checking the limit we discard timestamps older than the window.
  If the remaining count is >= the limit, we reject with HTTP 429.

Limitations:
  - State lives in memory → resets on server restart (fine for a portfolio app).
  - Single-process only → won't work correctly behind multiple Gunicorn workers.
  - For production use Redis + a library like slowapi or fastapi-limiter instead.
"""

import time
import asyncio
from collections import defaultdict
from typing import Optional
from fastapi import Request, HTTPException


class RateLimiter:
    def __init__(self, per_minute: int, per_day: int):
        self.per_minute = per_minute
        self.per_day = per_day
        # Stores lists of request timestamps keyed by IP address
        self._minute_store: dict[str, list[float]] = defaultdict(list)
        self._day_store: dict[str, list[float]] = defaultdict(list)
        # asyncio.Lock keeps concurrent requests from racing on the same IP
        self._lock = asyncio.Lock()

    async def check(self, ip: str) -> None:
        """
        Check whether `ip` is within both rate limits.
        Raises HTTP 429 if a limit is exceeded, including a Retry-After header.
        """
        async with self._lock:
            now = time.time()

            # Discard timestamps outside each window
            self._minute_store[ip] = [t for t in self._minute_store[ip] if now - t < 60]
            self._day_store[ip] = [t for t in self._day_store[ip] if now - t < 86_400]

            # Check per-minute limit
            if len(self._minute_store[ip]) >= self.per_minute:
                oldest = self._minute_store[ip][0]
                retry_after = max(1, int(60 - (now - oldest)) + 1)
                raise HTTPException(
                    status_code=429,
                    detail=(
                        f"Rate limit exceeded: {self.per_minute} requests per minute. "
                        f"Please wait {retry_after} second(s) and try again."
                    ),
                    headers={"Retry-After": str(retry_after)},
                )

            # Check per-day limit
            if len(self._day_store[ip]) >= self.per_day:
                raise HTTPException(
                    status_code=429,
                    detail=(
                        f"Daily limit reached: {self.per_day} requests per day. "
                        "Come back tomorrow!"
                    ),
                    headers={"Retry-After": "86400"},
                )

            # Request is within limits, record it
            self._minute_store[ip].append(now)
            self._day_store[ip].append(now)


# ── Module-level singleton ────────────────────────────────────────────────────
# Imported lazily so the Settings object is already initialised when this runs.
_limiter: Optional[RateLimiter] = None


def _get_limiter() -> RateLimiter:
    global _limiter
    if _limiter is None:
        from app.config import settings
        _limiter = RateLimiter(
            per_minute=settings.rate_limit_per_minute,
            per_day=settings.rate_limit_per_day,
        )
    return _limiter


# ── FastAPI dependency ────────────────────────────────────────────────────────

async def rate_limit(request: Request) -> None:
    """
    FastAPI dependency, inject with `Depends(rate_limit)` on any endpoint
    that should be protected.

    Identifies the caller by their IP address (request.client.host).
    """
    ip = request.client.host if request.client else "unknown"
    await _get_limiter().check(ip)
