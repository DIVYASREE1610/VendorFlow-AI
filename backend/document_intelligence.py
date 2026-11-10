
import re
from pathlib import Path

from backend.document_reader import extract_text_from_pdf


# Basic patterns for Indian PAN and GSTIN.
PAN_PATTERN = r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"

GSTIN_PATTERN = (
    r"\b[0-9]{2}[A-Z]{5}[0-9]{4}"
    r"[A-Z][A-Z0-9]Z[A-Z0-9]\b"
)


def normalize_name(name):
    """
    Normalize company names before comparison.
    Removes common legal suffixes.
    """

    name = name.upper().strip()

    name = re.sub(r"[^A-Z0-9\s]", " ", name)

    suffixes = [
        "PRIVATE LIMITED",
        "PVT LIMITED",
        "PVT LTD",
        "PRIVATE LTD",
        "LIMITED",
        "LTD"
    ]

    for suffix in suffixes:
        name = re.sub(
            rf"\b{re.escape(suffix)}\b",
            "",
            name
        )

    return " ".join(name.split())


def extract_company_name(text, document_type):
    """
    Extract company name using document-specific labels.
    """

    labels = {
        "pan_card": ["Name"],
        "gst_certificate": ["Legal name"],
        "cancelled_cheque": ["Account holder"]
    }

    for line_number, line in enumerate(text.splitlines()):

        cleaned_line = line.strip()

        for label in labels.get(document_type, []):

            if cleaned_line.lower() == label.lower():

                lines = text.splitlines()

                for next_line in lines[line_number + 1:]:

                    value = next_line.strip()

                    if value and not value.lower().startswith(
                        ("trade name", "fictional", "category", "bank")
                    ):
                        return value

    return None


def extract_document_information(file_path, document_type):
    """
    Read a PDF and extract relevant information.
    """

    result = extract_text_from_pdf(file_path)

    if not result["success"]:
        return {
            "success": False,
            "document_type": document_type,
            "message": result["message"],
            "company_name": None,
            "pan": None,
            "gstin": None
        }

    text = result["text"].upper()

    pan_match = re.search(PAN_PATTERN, text)
    gstin_match = re.search(GSTIN_PATTERN, text)

    company_name = extract_company_name(
        result["text"],
        document_type
    )

    return {
        "success": True,
        "document_type": document_type,
        "message": "Document information extracted.",
        "company_name": company_name,
        "pan": pan_match.group(0) if pan_match else None,
        "gstin": gstin_match.group(0) if gstin_match else None
    }


def analyze_documents(document_paths, vendor_data):
    """
    Extract information from all available documents
    and compare it with the submitted vendor information.
    """

    extracted_documents = {}
    comparisons = []

    for document_type, file_path in document_paths.items():

        extracted = extract_document_information(
            file_path,
            document_type
        )

        extracted_documents[document_type] = extracted

    # 1. Compare PAN from form and PAN document.
    submitted_pan = vendor_data.get("pan", "").strip().upper()

    pan_document = extracted_documents.get("pan_card", {})
    extracted_pan = pan_document.get("pan")

    if extracted_pan:
        comparisons.append({
            "check": "PAN document match",
            "status": (
                "PASSED"
                if submitted_pan == extracted_pan
                else "FAILED"
            ),
            "details": (
                "PAN in form matches the uploaded PAN document."
                if submitted_pan == extracted_pan
                else "PAN in form does not match the uploaded PAN document."
            )
        })

    # 2. Compare GSTIN from form and GST certificate.
    submitted_gstin = vendor_data.get("gstin", "").strip().upper()

    gst_document = extracted_documents.get("gst_certificate", {})
    extracted_gstin = gst_document.get("gstin")

    if extracted_gstin:
        comparisons.append({
            "check": "GSTIN document match",
            "status": (
                "PASSED"
                if submitted_gstin == extracted_gstin
                else "FAILED"
            ),
            "details": (
                "GSTIN in form matches the uploaded GST certificate."
                if submitted_gstin == extracted_gstin
                else "GSTIN in form does not match the uploaded GST certificate."
            )
        })

    # 3. Compare company names across documents.
    submitted_company = vendor_data.get("company_name", "")

    company_documents = []

    for document_type, document in extracted_documents.items():

        company_name = document.get("company_name")

        if company_name:
            company_documents.append({
                "document": document_type,
                "company_name": company_name
            })

    normalized_submitted = normalize_name(submitted_company)

    for document in company_documents:

        extracted_name = document["company_name"]

        is_match = (
            normalized_submitted
            == normalize_name(extracted_name)
        )

        comparisons.append({
            "check": f"Company name match - {document['document']}",
            "status": "PASSED" if is_match else "REVIEW",
            "details": (
                f"Company name matches: {extracted_name}"
                if is_match
                else f"Company name differs: {extracted_name}"
            )
        })

    # 4. Return the results.
    return {
        "documents": extracted_documents,
        "comparisons": comparisons
    }
