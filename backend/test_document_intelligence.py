from pathlib import Path
from backend.document_intelligence import analyze_documents

# Find the uploads folder
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"

# Sample vendor information matching our test PDFs
vendor_data = {
    "company_name": "ABC TECHNOLOGIES PRIVATE LIMITED",
    "pan": "ABCDE1234F",
    "gstin": "27ABCDE1234F1Z5",
    "bank_account_holder": "ABC TECHNOLOGIES PRIVATE LIMITED"
}


def find_latest_document(document_type):
    """
    Find the most recently uploaded PDF for a document type.
    """
    matching_files = list(
        UPLOAD_DIR.rglob(f"{document_type}_*.pdf")
    )

    if not matching_files:
        return None

    return max(matching_files, key=lambda file: file.stat().st_mtime)


# Find the latest PDF for each document type
document_paths = {}

for document_type in [
    "pan_card",
    "gst_certificate",
    "cancelled_cheque"
]:
    file_path = find_latest_document(document_type)

    if file_path:
        document_paths[document_type] = file_path
        print(f"Found {document_type}: {file_path.name}")
    else:
        print(f"Missing document: {document_type}")


print("\n========== DOCUMENT ANALYSIS ==========\n")

# Run document intelligence
result = analyze_documents(document_paths, vendor_data)

print("EXTRACTED DOCUMENT INFORMATION:")
for document_type, information in result.get("documents", {}).items():
    print(f"\n{document_type.upper()}")
    print(information)

print("\nDOCUMENT COMPARISONS:")
for comparison in result.get("comparisons", []):
    print(comparison)

print("\n========== TEST COMPLETED ==========")