"""
File processing service.

Handles uploaded files and extracts their text content
so it can be sent to Claude for analysis.
"""

import io
from fastapi import UploadFile, HTTPException
from pypdf import PdfReader

# Maximum file size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Supported text-based file extensions
TEXT_EXTENSIONS = {
    ".py", ".js", ".ts", ".tsx", ".jsx", ".html", ".css",
    ".json", ".yaml", ".yml", ".md", ".txt", ".sh", ".go",
    ".java", ".rs", ".cpp", ".c", ".h", ".rb", ".php",
    ".sql", ".env", ".toml", ".ini", ".cfg",
}


async def extract_file_content(file: UploadFile) -> tuple[str, str]:
    """
    Read an uploaded file and return its text content.

    Returns:
        (content, filename)

    Raises:
        HTTPException for unsupported types or oversized files.
    """
    # Read file bytes
    content_bytes = await file.read()

    if len(content_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum allowed size is 10 MB.",
        )

    filename = file.filename or "unknown_file"
    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    # Handle PDF files
    if extension == ".pdf":
        return _extract_pdf_text(content_bytes), filename

    # Handle text-based files
    if extension in TEXT_EXTENSIONS:
        try:
            text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Could not read file as text. Make sure it's a valid text file.",
            )

        # Truncate if too long
        if len(text) > 50_000:
            text = text[:50_000] + "\n\n[... file truncated at 50,000 characters ...]"

        return text, filename

    raise HTTPException(
        status_code=415,
        detail=(
            f"Unsupported file type: '{extension}'. "
            f"Supported types: PDF, {', '.join(sorted(TEXT_EXTENSIONS))}"
        ),
    )


def _extract_pdf_text(content_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    try:
        reader = PdfReader(io.BytesIO(content_bytes))
        pages_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages_text.append(f"--- Page {i + 1} ---\n{text}")

        full_text = "\n\n".join(pages_text)

        if not full_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No readable text found in this PDF (it may contain only images).",
            )

        # Truncate if too long
        if len(full_text) > 50_000:
            full_text = full_text[:50_000] + "\n\n[... document truncated ...]"

        return full_text

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=422, detail=f"Failed to parse PDF: {str(e)}")
