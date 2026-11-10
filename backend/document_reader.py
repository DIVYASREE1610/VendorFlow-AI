
import pymupdf as fitz
from pathlib import Path


def extract_text_from_pdf(file_path):
    """
    Extract text from a PDF document using PyMuPDF.
    """

    file_path = Path(file_path)

    if not file_path.exists():
        return {
            "success": False,
            "text": "",
            "message": "PDF file not found."
        }

    try:
        extracted_text = []

        with fitz.open(file_path) as document:

            for page_number, page in enumerate(document, start=1):

                page_text = page.get_text("text")

                if page_text.strip():
                    extracted_text.append(
                        f"Page {page_number}:\n{page_text}"
                    )

        full_text = "\n\n".join(extracted_text).strip()

        if not full_text:
            return {
                "success": False,
                "text": "",
                "message": (
                    "No selectable text found. "
                    "This may be a scanned PDF and require OCR."
                )
            }

        return {
            "success": True,
            "text": full_text,
            "message": "PDF text extracted successfully."
        }

    except Exception as error:

        return {
            "success": False,
            "text": "",
            "message": f"Unable to read PDF: {str(error)}"
        }
