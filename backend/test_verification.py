from backend.verification import verify_vendor


# TEST 1: Complete vendor application (Happy Path)
vendor_1 = {
    "company_name": "ABC Technologies",
    "pan": "ABCDE1234F",
    "gstin": "27ABCDE1234F1Z5",
    "bank_account_number": "123456789012",
    "bank_account_holder": "ABC Technologies",
    "ifsc": "HDFC0001234",
    "documents": [
        "pan_card",
        "gst_certificate",
        "cancelled_cheque"
    ]
}


# TEST 2: Missing GST certificate
vendor_2 = {
    "company_name": "XYZ Industries",
    "pan": "FGHIJ5678K",
    "gstin": "27FGHIJ5678K1Z5",
    "bank_account_number": "987654321012",
    "bank_account_holder": "XYZ Industries",
    "ifsc": "SBIN0001234",
    "documents": [
        "pan_card",
        "cancelled_cheque"
    ]
}


# TEST 3: Invalid PAN format
vendor_3 = {
    "company_name": "Tech Solutions",
    "pan": "INVALID123",
    "gstin": "27ABCDE1234F1Z5",
    "bank_account_number": "123456789012",
    "bank_account_holder": "Tech Solutions",
    "ifsc": "HDFC0001234",
    "documents": [
        "pan_card",
        "gst_certificate",
        "cancelled_cheque"
    ]
}


test_cases = [
    ("HAPPY PATH", vendor_1),
    ("MISSING DOCUMENT", vendor_2),
    ("INVALID PAN", vendor_3)
]


for test_name, vendor in test_cases:

    result = verify_vendor(vendor)

    print("\n" + "=" * 50)
    print("TEST:", test_name)
    print("DECISION:", result["decision"])
    print("REASON:", result["reason"])

    print("\nINDIVIDUAL CHECKS:")

    for check in result["checks"]:
        print(
            check["check"],
            "->",
            check["status"],
            "|",
            check["details"]
        )

    print("\nFOLLOW-UP:")

    if result["follow_up"]:
        for message in result["follow_up"]:
            print("-", message)
    else:
        print("No follow-up required.")