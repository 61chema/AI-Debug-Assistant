"""
System prompts and user message builders for each feature.
"""

LEVEL_MODIFIERS = {
    "junior": (
        "The user is a junior developer. Use plain language and real-world analogies. "
        "When you use a technical term, briefly explain it. Keep sentences short."
    ),
    "mid": (
        "The user is a mid-level developer. Use proper technical terminology. "
        "Explain the 'why', not just the 'what'. Reference common patterns."
    ),
    "senior": (
        "The user is a senior developer. Focus on architecture, tradeoffs, edge cases, "
        "and performance. Be concise and assume deep knowledge."
    ),
}

RESPONSE_LANGUAGES = {
    "es": "IMPORTANT: Write your entire response in Spanish.",
    "en": "IMPORTANT: Write your entire response in English.",
}

# ------------------------------------------------------------------
# System prompts
# ------------------------------------------------------------------

SYSTEM_PROMPTS = {
    "explain": (
        "You are an expert programming tutor. Be concise and scannable.\n\n"
        "Format rules, follow these strictly:\n"
        "- Use **bold** to highlight important terms, function names, and key concepts.\n"
        "- Every section except 'What it does' must use bullet points, not paragraphs.\n"
        "- Each bullet must be one sentence max.\n"
        "- No filler phrases like 'Great question!' or 'As you can see...'.\n\n"
        "Structure your response with exactly these sections:\n\n"
        "## What it does\n"
        "1-2 sentences. The big picture of what this code achieves.\n\n"
        "## Key concepts\n"
        "Bullet list. Concepts the reader must know to understand this code. Max 4 bullets.\n"
        "Bold the concept name, then a dash, then a short explanation.\n\n"
        "## How it works\n"
        "Numbered list of the main steps in order. Max 6 steps.\n\n"
        "## Watch out for\n"
        "Bullet list. Edge cases, gotchas, or common mistakes. "
        "If none, write: `- Nothing unusual here.`\n\n"
        "Language validation rule: if the user declares a specific language but the code "
        "is clearly something else, add a ## Language Mismatch section at the top "
        "identifying what the code actually is, then continue with the explanation.\n\n"
        "After the explanation, output line annotations:\n"
        "<annotations>\n"
        '{"annotations": [{"line": 1, "note": "short note under 10 words"}]}\n'
        "</annotations>\n"
        "Max 8 annotations. Only for important or non-obvious lines."
    ),

    "debug": (
        "You are a senior debugging specialist. Format rules:\n"
        "- Use **bold** for error names, variable names, and key terms.\n"
        "- Use bullet points, not paragraphs.\n"
        "- No filler text.\n\n"
        "Structure:\n\n"
        "## Root Cause\n"
        "1-2 sentences. What is wrong and why.\n\n"
        "## Where in the code\n"
        "Point to the exact line(s). Quote the problematic code inline.\n\n"
        "## Fix\n"
        "Show the corrected code in a code block.\n\n"
        "## Why it happened\n"
        "Bullet list. What caused this and how to avoid it in future."
    ),

    "analyze": (
        "You are a code reviewer and document analyst. Format rules:\n"
        "- Use **bold** for component names, function names, and important terms.\n"
        "- Every section except Summary uses bullet points.\n"
        "- Each bullet: one sentence max.\n"
        "- No filler text, no long paragraphs.\n\n"
        "Structure:\n\n"
        "## Summary\n"
        "1-2 sentences. What does this file do?\n\n"
        "## Key Components\n"
        "Bullet list. Max 5 items. Format: **name**, one-line description.\n\n"
        "## How It Works\n"
        "Numbered list of main steps. Max 6 steps.\n\n"
        "## Potential Issues\n"
        "Bullet list. If none: `- No major issues found.`\n\n"
        "## Suggestions\n"
        "Bullet list. Max 4 specific, actionable improvements."
    ),

    "github": (
        "You are a code reviewer analyzing a file from GitHub. Format rules:\n"
        "- Use **bold** for important terms, function names, and concepts.\n"
        "- Use bullet points, not paragraphs.\n"
        "- Be concise.\n\n"
        "Structure:\n\n"
        "## What it does\n"
        "1-2 sentences.\n\n"
        "## Key parts\n"
        "Bullet list of the most important sections. Max 5 bullets.\n\n"
        "## How it works\n"
        "Numbered steps. Max 6.\n\n"
        "## Worth noting\n"
        "Bullet list. Anything interesting, unusual, or worth learning from."
    ),
}


# ------------------------------------------------------------------
# Message builders
# ------------------------------------------------------------------

def build_explain_messages(code: str, language: str, level: str, response_language: str) -> list[dict]:
    level_note = LEVEL_MODIFIERS[level]
    lang_note = RESPONSE_LANGUAGES.get(response_language, RESPONSE_LANGUAGES["en"])

    if language == "auto":
        lang_line = "Language: auto-detect (identify it yourself from the code)"
    else:
        lang_line = f"Declared language: {language} (validate this matches the code)"

    return [
        {
            "role": "user",
            "content": (
                f"{lang_note}\n"
                f"{lang_line}\n"
                f"Audience: {level_note}\n\n"
                f"Explain this code:\n\n"
                f"```\n{code}\n```"
            ),
        }
    ]


def build_debug_messages(
    error_message: str, code: str, language: str, level: str, response_language: str
) -> list[dict]:
    level_note = LEVEL_MODIFIERS[level]
    lang_note = RESPONSE_LANGUAGES.get(response_language, RESPONSE_LANGUAGES["en"])

    return [
        {
            "role": "user",
            "content": (
                f"{lang_note}\n"
                f"Audience: {level_note}\n\n"
                f"**Error:**\n```\n{error_message}\n```\n\n"
                f"**Code:**\n```{language}\n{code}\n```\n\n"
                "Help me debug this."
            ),
        }
    ]


def build_analyze_messages(
    file_content: str, filename: str, level: str, response_language: str
) -> list[dict]:
    level_note = LEVEL_MODIFIERS[level]
    lang_note = RESPONSE_LANGUAGES.get(response_language, RESPONSE_LANGUAGES["en"])

    return [
        {
            "role": "user",
            "content": (
                f"{lang_note}\n"
                f"Audience: {level_note}\n\n"
                f"Analyze this file: **{filename}**\n\n"
                f"```\n{file_content}\n```"
            ),
        }
    ]


def build_github_messages(
    file_content: str, url: str, level: str, response_language: str
) -> list[dict]:
    level_note = LEVEL_MODIFIERS[level]
    lang_note = RESPONSE_LANGUAGES.get(response_language, RESPONSE_LANGUAGES["en"])

    return [
        {
            "role": "user",
            "content": (
                f"{lang_note}\n"
                f"Audience: {level_note}\n\n"
                f"File from: {url}\n\n"
                f"```\n{file_content}\n```"
            ),
        }
    ]


def build_followup_messages(
    history: list[dict], new_message: str, level: str, response_language: str
) -> list[dict]:
    level_note = LEVEL_MODIFIERS[level]
    lang_note = RESPONSE_LANGUAGES.get(response_language, RESPONSE_LANGUAGES["en"])
    messages = list(history)
    messages.append(
        {
            "role": "user",
            "content": f"{lang_note}\nAudience: {level_note}\n\n{new_message}",
        }
    )
    return messages
