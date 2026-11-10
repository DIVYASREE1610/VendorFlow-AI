import re


def validate_pan(pan):
    """Check the basic format of an Indian PAN."""
    pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]$"
    return bool(re.fullmatch(pattern, pan.upper().strip()))


def validate_gstin(gstin):
    """Check the basic format of a GSTIN."""
    pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$"
    return bool(re.fullmatch(pattern, gstin.upper().strip()))


def validate_ifsc(ifsc):
    """Check the basic format of an IFSC code."""
    pattern = r"^[A-Z]{4}0[A-Z0-9]{6}$"
    return bool(re.fullmatch(pattern, ifsc.upper().strip()))


def normalize_name(name):
    """Normalize names before comparing them."""
    return " ".join(name.upper().strip().split())


def verify_vendor(vendor):
    """
    Verify vendor information and return:
    APPROVED, PENDING, or REJECTED.
    """

    checks = []
    missing_fields = []
    errors = []
    follow_up = []

    # 1. Check required company information
    required_fields = [
        "company_name",
        "pan",
        "gstin",
        "bank_account_number",
        "bank_account_holder",
        "ifsc",
    ]

    for field in required_fields:
        value = vendor.get(field)

        if not value or not str(value).strip():
            missing_fields.append(field)

    if missing_fields:
        checks.append({
            "check": "Required company information",
            "status": "FAILED",
            "details": f"Missing fields: {', '.join(missing_fields)}"
        })
        follow_up.append(
            f"Please provide: {', '.join(missing_fields)}"
        )
    else:
        checks.append({
            "check": "Required company information",
            "status": "PASSED",
            "details": "All required fields are provided."
        })

    # 2. PAN format validation
    pan = vendor.get("pan", "")

    if pan and validate_pan(pan):
        checks.append({
            "check": "PAN format",
            "status": "PASSED",
            "details": "PAN follows the expected format."
        })
    elif pan:
        checks.append({
            "check": "PAN format",
            "status": "FAILED",
            "details": "PAN format is invalid."
        })
        errors.append("Invalid PAN format.")

    # 3. GSTIN format validation
    gstin = vendor.get("gstin", "")

    if gstin and validate_gstin(gstin):
        checks.append({
            "check": "GSTIN format",
            "status": "PASSED",
            "details": "GSTIN follows the expected format."
        })
    elif gstin:
        checks.append({
            "check": "GSTIN format",
            "status": "FAILED",
            "details": "GSTIN format is invalid."
        })
        errors.append("Invalid GSTIN format.")

    # 4. IFSC format validation
    ifsc = vendor.get("ifsc", "")

    if ifsc and validate_ifsc(ifsc):
        checks.append({
            "check": "IFSC format",
            "status": "PASSED",
            "details": "IFSC follows the expected format."
        })
    elif ifsc:
        checks.append({
            "check": "IFSC format",
            "status": "FAILED",
            "details": "IFSC format is invalid."
        })
        errors.append("Invalid IFSC format.")

    # 5. Compare company name and bank account holder name
    company_name = vendor.get("company_name", "")
    account_holder = vendor.get("bank_account_holder", "")

    if company_name and account_holder:
        if normalize_name(company_name) == normalize_name(account_holder):
            checks.append({
                "check": "Bank account name match",
                "status": "PASSED",
                "details": "Company name matches bank account holder name."
            })
        else:
            checks.append({
                "check": "Bank account name match",
                "status": "REVIEW",
                "details": "Company name and bank account holder name differ."
            })
            follow_up.append(
                "Please provide supporting documentation explaining the name mismatch."
            )

    # 6. Check required compliance documents
    required_documents = {
        "pan_card",
        "gst_certificate",
        "cancelled_cheque"
    }

    uploaded_documents = set(vendor.get("documents", []))
    missing_documents = required_documents - uploaded_documents

    if missing_documents:
        checks.append({
            "check": "Compliance documents",
            "status": "FAILED",
            "details": f"Missing documents: {', '.join(sorted(missing_documents))}"
        })
        follow_up.append(
            f"Please upload: {', '.join(sorted(missing_documents))}"
        )
    else:
        checks.append({
            "check": "Compliance documents",
            "status": "PASSED",
            "details": "All required document types have been uploaded."
        })

    # 7. Final decision
    if errors:
        decision = "REJECTED"
        reason = "One or more mandatory identification formats are invalid."

    elif missing_fields or missing_documents:
        decision = "PENDING"
        reason = "Additional information or documents are required."

    elif any(check["status"] == "REVIEW" for check in checks):
        decision = "PENDING"
        reason = "Manual review is required due to a name mismatch."

    else:
        decision = "APPROVED"
        reason = "All implemented verification checks passed."

    return {
        "decision": decision,
        "reason": reason,
        "checks": checks,
        "follow_up": follow_up,
        "limitations": [
            "Format validation does not confirm official PAN or GST registration.",
            "Uploaded document presence does not establish document authenticity.",
            "Bank account ownership has not been independently verified."
        ]
    }