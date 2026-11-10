
from pathlib import Path
from backend.document_reader import extract_text_from_pdf

# Find the uploaded PDF documents.
upload_folder = Path(__file__).resolve().parent / "uploads"

pdf_files = list(upload_folder.rglob("*.pdf"))

if not pdf_files:
    print("No PDF files found in backend/uploads/")
else:
    for pdf_file in pdf_files:

        print("\n" + "=" * 60)
        print("DOCUMENT:", pdf_file.name)
        print("=" * 60)

        result = extract_text_from_pdf(pdf_file)

        print("Success:", result["success"])
        print("Message:", result["message"])

        if result["success"]:
            print("\nEXTRACTED TEXT:")
            print(result["text"])
