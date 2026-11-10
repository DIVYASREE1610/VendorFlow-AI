const API_BASE_URL = "http://127.0.0.1:8000";

// Common helper to handle API responses
async function handleResponse(response, defaultMessage) {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response received from the backend");
  }

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || defaultMessage
    );
  }

  return data;
}

// Get all vendor applications
export async function getApplications() {
  const response = await fetch(`${API_BASE_URL}/applications`);

  return handleResponse(response, "Unable to fetch applications");
}

// Get details of a specific application
export async function getApplicationById(applicationId) {
  const response = await fetch(
    `${API_BASE_URL}/applications/${applicationId}`
  );

  return handleResponse(
    response,
    "Unable to fetch application details"
  );
}

// Submit a new vendor application
// Supports both JSON and FormData submissions
export async function submitVendor(vendorData) {
  const isFormData = vendorData instanceof FormData;

  const response = await fetch(`${API_BASE_URL}/submit-vendor`, {
    method: "POST",
    headers: isFormData
      ? {}
      : { "Content-Type": "application/json" },
    body: isFormData
      ? vendorData
      : JSON.stringify(vendorData),
  });

  return handleResponse(response, "Vendor submission failed");
}

// Manually approve or reject a pending application
export async function updateApplicationDecision(
  applicationId,
  decision,
  reviewerComment
) {
  const response = await fetch(
    `${API_BASE_URL}/applications/${applicationId}/decision`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        decision: decision,
        reviewer_comment: reviewerComment,
      }),
    }
  );

  return handleResponse(
    response,
    "Unable to update application decision"
  );
}