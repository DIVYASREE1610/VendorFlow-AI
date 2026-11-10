import uuid
import json
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

from backend.verification import verify_vendor
from backend.document_intelligence import analyze_documents
from backend.database import (
    init_db,
    save_application,
    get_all_applications,
    get_application,
    get_connection
)

init_db()

app = FastAPI(
    title="VendorFlow AI",
    description="Document-Assisted Vendor Onboarding and Verification System",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}


@app.get("/")
def home():
    return {
        "message": "Welcome to VendorFlow AI",
        "status": "Backend is running successfully"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "VendorFlow AI"
    }


@app.post("/submit-vendor")
async def submit_vendor(
    company_name: str = Form(...),
    pan: str = Form(...),
    gstin: str = Form(...),
    bank_account_number: str = Form(...),
    bank_account_holder: str = Form(...),
    ifsc: str = Form(...),

    pan_card: UploadFile = File(None),
    gst_certificate: UploadFile = File(None),
    cancelled_cheque: UploadFile = File(None)
):

    # --------------------------------------------------
    # 1. Collect vendor form information
    # --------------------------------------------------

    vendor = {
        "company_name": company_name.strip(),
        "pan": pan.strip().upper(),
        "gstin": gstin.strip().upper(),
        "bank_account_number": bank_account_number.strip(),
        "bank_account_holder": bank_account_holder.strip(),
        "ifsc": ifsc.strip().upper(),
        "documents": []
    }

    document_files = {
        "pan_card": pan_card,
        "gst_certificate": gst_certificate,
        "cancelled_cheque": cancelled_cheque
    }

    uploaded_documents = []

    # --------------------------------------------------
    # 2. Validate uploaded files
    # --------------------------------------------------

    for document_type, file in document_files.items():

        if file is None or not file.filename:
            continue

        extension = Path(file.filename).suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type for {document_type}"
            )

        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"{document_type} exceeds the 5 MB limit"
            )

        if not content:
            raise HTTPException(
                status_code=400,
                detail=f"{document_type} is empty"
            )

        vendor["documents"].append(document_type)

        uploaded_documents.append({
            "document_type": document_type,
            "original_filename": Path(file.filename).name,
            "display_name": document_type.replace("_", " ").title(),
            "content": content,
            "extension": extension
        })

    # --------------------------------------------------
    # 3. Run normal vendor verification
    # --------------------------------------------------

    result = verify_vendor(vendor)

    # --------------------------------------------------
    # 4. Create application folder and save documents
    # --------------------------------------------------

    temporary_id = "TEMP-" + uuid.uuid4().hex[:8].upper()

    application_folder = UPLOAD_DIR / temporary_id
    application_folder.mkdir(parents=True, exist_ok=True)

    response_documents = []
    document_paths = {}

    for document in uploaded_documents:

        safe_filename = (
            f"{document['document_type']}_"
            f"{uuid.uuid4().hex[:8]}"
            f"{document['extension']}"
        )

        file_path = application_folder / safe_filename
        file_path.write_bytes(document["content"])

        response_documents.append({
            "document_type": document["document_type"],
            "display_name": document["display_name"],
            "original_filename": document["original_filename"]
        })

        # Only PDFs are currently supported by our text extractor.
        if document["extension"] == ".pdf":
            document_paths[document["document_type"]] = file_path

    # --------------------------------------------------
    # 5. Run document intelligence
    # --------------------------------------------------

    document_analysis = {
        "documents": {},
        "comparisons": [],
        "message": "No PDF documents were available for text analysis."
    }

    if document_paths:

        try:
            document_analysis = analyze_documents(
                document_paths,
                vendor
            )

            # Add extracted document comparisons to the main result.
            for comparison in document_analysis.get("comparisons", []):

                result.setdefault("checks", []).append(comparison)

            # Check whether uploaded PDFs were readable.
            for document_type, information in document_analysis.get(
                "documents", {}
            ).items():

                if not information.get("success", False):

                    result.setdefault("checks", []).append({
                        "check": f"{document_type} text extraction",
                        "status": "REVIEW",
                        "details": information.get(
                            "message",
                            "Document could not be read."
                        )
                    })

                    result.setdefault("follow_up", []).append(
                        f"Please upload a readable {document_type.replace('_', ' ')} document."
                    )

            # Check whether important identifiers were actually extracted.
            extraction_requirements = {
                "pan_card": "pan",
                "gst_certificate": "gstin"
            }

            for document_type, field_name in extraction_requirements.items():

                if document_type in document_paths:

                    information = document_analysis.get(
                        "documents", {}
                    ).get(document_type, {})

                    if information.get("success") and not information.get(field_name):

                        result.setdefault("checks", []).append({
                            "check": f"{field_name.upper()} extraction",
                            "status": "REVIEW",
                            "details": (
                                f"{field_name.upper()} could not be "
                                "identified in the uploaded document."
                            )
                        })

                        result.setdefault("follow_up", []).append(
                            f"Please provide a document with a clearly readable {field_name.upper()}."
                        )

            # Compare bank account holder with the cancelled cheque.
            cheque_information = document_analysis.get(
                "documents", {}
            ).get("cancelled_cheque", {})

            if "cancelled_cheque" in document_paths:

                extracted_holder = cheque_information.get("company_name")

                if extracted_holder:

                    submitted_holder = vendor["bank_account_holder"]

                    # Reuse name normalization from document intelligence.
                    from backend.document_intelligence import normalize_name

                    if normalize_name(extracted_holder) == normalize_name(
                        submitted_holder
                    ):

                        result.setdefault("checks", []).append({
                            "check": "Bank account holder match",
                            "status": "PASSED",
                            "details": (
                                "Bank account holder name matches "
                                "the uploaded cancelled cheque."
                            )
                        })

                    else:

                        result.setdefault("checks", []).append({
                            "check": "Bank account holder match",
                            "status": "REVIEW",
                            "details": (
                                "Bank account holder name does not match "
                                "the uploaded cancelled cheque."
                            )
                        })

                        result.setdefault("follow_up", []).append(
                            "Please clarify the bank account holder name mismatch."
                        )

                elif cheque_information.get("success"):

                    result.setdefault("checks", []).append({
                        "check": "Bank account holder match",
                        "status": "REVIEW",
                        "details": (
                            "Could not extract the account holder name "
                            "from the cancelled cheque."
                        )
                    })

                    result.setdefault("follow_up", []).append(
                        "Please upload a cancelled cheque with a clearly readable account holder name."
                    )

            # --------------------------------------------------
            # 6. Determine whether manual review is required
            # --------------------------------------------------

            review_required = any(
                check.get("status") in ["REVIEW", "FAILED"]
                for check in result.get("checks", [])
            )

            if review_required and result.get("decision") != "REJECTED":

                result["decision"] = "PENDING"

                result["reason"] = (
                    "Document verification requires manual review. "
                    "Please review the document comparison results."
                )

            result["follow_up"] = list(dict.fromkeys(
                result.get("follow_up", [])
            ))

        except Exception as error:

            # Do not approve an application if document analysis fails.
            if result.get("decision") != "REJECTED":
                result["decision"] = "PENDING"

            result["reason"] = (
                "Document analysis could not be completed. "
                "Manual review is required."
            )

            result.setdefault("checks", []).append({
                "check": "Document intelligence",
                "status": "REVIEW",
                "details": str(error)
            })

            result.setdefault("follow_up", []).append(
                "Please ask the verification team to review the uploaded documents."
            )

            document_analysis = {
                "documents": {},
                "comparisons": [],
                "message": "Document analysis encountered an error."
            }

    # --------------------------------------------------
    # 7. Image files require manual review
    # --------------------------------------------------

    for document in uploaded_documents:

        if document["extension"] != ".pdf":

            result.setdefault("checks", []).append({
                "check": f"{document['document_type']} image analysis",
                "status": "REVIEW",
                "details": (
                    "Image uploaded successfully, but automated text "
                    "extraction is currently supported only for PDFs."
                )
            })

            result.setdefault("follow_up", []).append(
                f"Please provide a PDF version of the {document['document_type'].replace('_', ' ')} for automated text analysis."
            )

            if result.get("decision") != "REJECTED":
                result["decision"] = "PENDING"

                result["reason"] = (
                    "One or more uploaded documents require manual review."
                )

    result["follow_up"] = list(dict.fromkeys(
        result.get("follow_up", [])
    ))

    # --------------------------------------------------
    # 8. Save final application result in Supabase PostgreSQL
    # --------------------------------------------------

    application_id = save_application(vendor, result)

    # Rename temporary upload folder to the final application ID.
    final_folder = UPLOAD_DIR / application_id

    if application_folder.exists():
        application_folder.rename(final_folder)

    # --------------------------------------------------
    # 9. Return complete result to frontend
    # --------------------------------------------------

    return {
        "message": "Vendor verification completed",
        "application_id": application_id,
        "vendor_name": vendor["company_name"],
        "verification_result": result,
        "document_analysis": document_analysis,
        "uploaded_documents": response_documents
    }


@app.post("/verify-vendor")
def verify_vendor_application(vendor: dict):

    result = verify_vendor(vendor)

    application_id = save_application(vendor, result)

    return {
        "message": "Vendor verification completed",
        "application_id": application_id,
        "vendor_name": vendor.get("company_name", "Unknown"),
        "verification_result": result
    }


@app.get("/applications")
def list_applications():

    applications = get_all_applications()

    return {
        "total_applications": len(applications),
        "applications": applications
    }


@app.get("/applications/{application_id}")
def application_details(application_id: str):

    application = get_application(application_id)

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return application


# --------------------------------------------------
# MANUAL PROCUREMENT DECISION
# --------------------------------------------------

class ManualDecisionRequest(BaseModel):
    decision: str
    reviewer_comment: str = Field(..., min_length=5, max_length=1000)


@app.post("/applications/{application_id}/decision")
def update_application_decision(
    application_id: str,
    request: ManualDecisionRequest
):
    """
    Allows a procurement reviewer to approve or reject a PENDING application.

    Note: Authentication/authorization must be added before production use.
    """

    decision = request.decision.strip().upper()
    reviewer_comment = request.reviewer_comment.strip()

    if decision not in {"APPROVED", "REJECTED"}:
        raise HTTPException(
            status_code=400,
            detail="Decision must be either APPROVED or REJECTED."
        )

    if len(reviewer_comment) < 5:
        raise HTTPException(
            status_code=400,
            detail="Please provide a meaningful reviewer comment (at least 5 characters)."
        )

    application = get_application(application_id)

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found."
        )

    if application.get("decision") != "PENDING":
        raise HTTPException(
            status_code=409,
            detail="Only PENDING applications can receive a manual decision."
        )

    checks = application.get("checks", [])
    follow_up = application.get("follow_up", [])

    # Add an auditable check entry to the existing verification report.
    checks.append({
        "check": "Manual procurement decision",
        "status": "PASSED" if decision == "APPROVED" else "REJECTED",
        "details": f"{decision.title()} by procurement reviewer: {reviewer_comment}"
    })

    # Keep the original automated verification reason and record the review outcome.
    updated_reason = (
        f"Manual procurement decision: {decision}. "
        f"Reviewer comment: {reviewer_comment}"
    )

    # Update the record using PostgreSQL-compatible SQL.
    # The conditional WHERE clause prevents a second reviewer action
    # from overwriting an application that has already been reviewed.
    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE applications
            SET decision = %s, reason = %s, checks = %s, follow_up = %s
            WHERE application_id = %s AND decision = 'PENDING'
            """,
            (
                decision,
                updated_reason,
                json.dumps(checks),
                json.dumps([]),
                application_id
            )
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=409,
                detail="This application has already been reviewed. Refresh and try again."
            )

    updated_application = get_application(application_id)

    return {
        "message": f"Application {decision.lower()} successfully.",
        "application": updated_application
    }

