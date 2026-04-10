"""
GitHub service — fetches raw file content from public GitHub URLs.

Transforms a normal GitHub URL like:
  https://github.com/owner/repo/blob/main/src/utils.py

Into a raw content URL:
  https://raw.githubusercontent.com/owner/repo/main/src/utils.py

Then fetches the content with httpx (async HTTP client).
"""

import re
import httpx
from fastapi import HTTPException
from app.config import settings


def _transform_to_raw_url(github_url: str) -> str:
    """
    Convert a standard GitHub file URL to its raw content URL.
    Raises ValueError if the URL doesn't match the expected pattern.
    """
    # Pattern: https://github.com/{owner}/{repo}/blob/{branch}/{path}
    pattern = r"https://github\.com/([^/]+)/([^/]+)/blob/([^/]+)/(.+)"
    match = re.match(pattern, github_url)

    if not match:
        raise ValueError(
            "URL must be a GitHub file URL like: "
            "https://github.com/owner/repo/blob/branch/path/to/file"
        )

    owner, repo, branch, path = match.groups()
    return f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"


async def fetch_github_file(url: str) -> tuple[str, str]:
    """
    Fetch raw content from a GitHub file URL.

    Returns:
        (content, filename) — the file content as a string and the filename.

    Raises:
        HTTPException if the URL is invalid or the file can't be fetched.
    """
    try:
        raw_url = _transform_to_raw_url(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Build headers — include GitHub token if available (avoids rate limiting)
    headers = {"Accept": "text/plain"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(raw_url, headers=headers)

    if response.status_code == 404:
        raise HTTPException(
            status_code=404,
            detail="File not found. Make sure the URL points to an existing public file.",
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"GitHub returned status {response.status_code}.",
        )

    # Extract filename from the URL path
    filename = url.rstrip("/").split("/")[-1]
    content = response.text

    # Limit content size to avoid sending huge files to Claude
    if len(content) > 50_000:
        content = content[:50_000] + "\n\n[... file truncated at 50,000 characters ...]"

    return content, filename
