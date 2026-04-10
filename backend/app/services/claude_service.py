"""
Claude API service.

All communication with the Anthropic API lives here.
Every function is an async generator that yields SSE-formatted strings.

SSE (Server-Sent Events) is a protocol where the server sends a stream
of "data: <content>\n\n" lines. The browser reads them one by one,
giving you the typewriter effect.
"""

import json
import re
from typing import AsyncGenerator
import anthropic
from app.config import settings
from app.utils.prompts import (
    SYSTEM_PROMPTS,
    build_explain_messages,
    build_debug_messages,
    build_analyze_messages,
    build_github_messages,
    build_followup_messages,
)

# Create a single Anthropic client (reads ANTHROPIC_API_KEY from env automatically)
client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

# Max tokens for Claude's response
MAX_TOKENS = 4096


def _format_sse(event: str, data: str) -> str:
    """Format a single SSE message.

    Newlines inside the data payload must be escaped as \\n because
    bare newlines break SSE framing (the browser uses them as field separators).
    The frontend is responsible for unescaping \\n back to real newlines.
    """
    escaped = data.replace("\n", "\\n")
    return f"event: {event}\ndata: {escaped}\n\n"


def _extract_annotations(text: str) -> tuple[str, list[dict]]:
    """
    Extract the <annotations> block from Claude's response.
    Returns (clean_text, annotations_list).
    """
    pattern = r"<annotations>\s*(.*?)\s*</annotations>"
    match = re.search(pattern, text, re.DOTALL)

    if not match:
        return text, []

    try:
        json_str = match.group(1)
        data = json.loads(json_str)
        annotations = data.get("annotations", [])
    except (json.JSONDecodeError, AttributeError):
        annotations = []

    # Remove the annotations block from the displayed text
    clean_text = re.sub(pattern, "", text, flags=re.DOTALL).strip()
    return clean_text, annotations


def _handle_anthropic_error(e: Exception) -> str:
    """Convert Anthropic API errors into user-friendly messages."""
    if isinstance(e, anthropic.APIStatusError):
        if "overloaded_error" in str(e):
            return "Claude's servers are temporarily overloaded. Please try again in a few seconds."
        if e.status_code == 401:
            return "Invalid API key. Check your ANTHROPIC_API_KEY in the .env file."
        if e.status_code == 429:
            return "Rate limit reached. Please wait a moment and try again."
        return f"API error: {e.message}"
    return f"Unexpected error: {str(e)}"


async def stream_explain(
    code: str, language: str, level: str, response_language: str = "en"
) -> AsyncGenerator[str, None]:
    """Stream a code explanation from Claude."""
    messages = build_explain_messages(code, language, level, response_language)
    full_response = ""

    try:
        async with client.messages.stream(
            model=settings.claude_model,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPTS["explain"],
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                full_response += text
                yield _format_sse("text", text)

        _, annotations = _extract_annotations(full_response)
        if annotations:
            yield _format_sse("annotations", json.dumps(annotations))
    except Exception as e:
        yield _format_sse("error", _handle_anthropic_error(e))

    yield _format_sse("done", "")


async def stream_debug(
    error_message: str, code: str, language: str, level: str, response_language: str = "en"
) -> AsyncGenerator[str, None]:
    """Stream a debug analysis from Claude."""
    messages = build_debug_messages(error_message, code, language, level, response_language)

    try:
        async with client.messages.stream(
            model=settings.claude_model,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPTS["debug"],
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield _format_sse("text", text)
    except Exception as e:
        yield _format_sse("error", _handle_anthropic_error(e))

    yield _format_sse("done", "")


async def stream_analyze(
    file_content: str, filename: str, level: str, response_language: str = "en"
) -> AsyncGenerator[str, None]:
    """Stream a file analysis from Claude."""
    messages = build_analyze_messages(file_content, filename, level, response_language)

    try:
        async with client.messages.stream(
            model=settings.claude_model,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPTS["analyze"],
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield _format_sse("text", text)
    except Exception as e:
        yield _format_sse("error", _handle_anthropic_error(e))

    yield _format_sse("done", "")


async def stream_github(
    file_content: str, url: str, level: str, response_language: str = "en"
) -> AsyncGenerator[str, None]:
    """Stream a GitHub file analysis from Claude."""
    messages = build_github_messages(file_content, url, level, response_language)

    try:
        async with client.messages.stream(
            model=settings.claude_model,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPTS["github"],
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield _format_sse("text", text)
    except Exception as e:
        yield _format_sse("error", _handle_anthropic_error(e))

    yield _format_sse("done", "")


async def stream_followup(
    history: list[dict], new_message: str, level: str, feature: str
) -> AsyncGenerator[str, None]:
    """Stream a follow-up response using full conversation history."""
    system = SYSTEM_PROMPTS.get(feature, SYSTEM_PROMPTS["explain"])
    messages = build_followup_messages(history, new_message, level)

    try:
        async with client.messages.stream(
            model=settings.claude_model,
            max_tokens=MAX_TOKENS,
            system=system,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield _format_sse("text", text)
    except Exception as e:
        yield _format_sse("error", _handle_anthropic_error(e))

    yield _format_sse("done", "")
