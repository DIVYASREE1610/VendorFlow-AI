import streamlit as st
import plotly.graph_objects as go

# ==========================================
# PAGE CONFIGURATION
# ==========================================

st.set_page_config(
    page_title="VendorFlow AI",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================
# CUSTOM CSS
# ==========================================

st.markdown("""
<style>

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}

.stApp {
    background: #080B14;
    color: #F1F5F9;
}

[data-testid="stSidebar"] {
    background: #0D1220;
    border-right: 1px solid #20283A;
}

[data-testid="stSidebar"] .stMarkdown {
    color: #E2E8F0;
}

.main-title {
    font-size: 32px;
    font-weight: 800;
    color: #F8FAFC;
    margin-bottom: 5px;
}

.subtitle {
    color: #8491A8;
    font-size: 14px;
    margin-bottom: 25px;
}

.brand {
    font-size: 25px;
    font-weight: 800;
    color: #A78BFA;
    padding: 15px 0 5px 0;
}

.brand-subtitle {
    font-size: 11px;
    color: #64748B;
    letter-spacing: 2px;
    margin-bottom: 30px;
}

.metric-card {
    background: linear-gradient(145deg, #151D30, #101625);
    border: 1px solid #28334B;
    border-radius: 15px;
    padding: 22px;
    min-height: 135px;
}

.metric-label {
    color: #94A3B8;
    font-size: 13px;
}

.metric-value {
    font-size: 30px;
    font-weight: 800;
    color: #F8FAFC;
    margin-top: 12px;
}

.metric-icon {
    font-size: 23px;
}

.section-title {
    font-size: 19px;
    font-weight: 700;
    color: #F1F5F9;
    margin-top: 20px;
    margin-bottom: 15px;
}

.info-card {
    background: #111827;
    border: 1px solid #273449;
    border-radius: 14px;
    padding: 20px;
}

.status-approved {
    color: #34D399;
    font-weight: 700;
}

.status-pending {
    color: #FBBF24;
    font-weight: 700;
}

.status-rejected {
    color: #FB7185;
    font-weight: 700;
}

div.stButton > button {
    background: linear-gradient(90deg, #7C3AED, #4F46E5);
    color: white;
    border: none;
    border-radius: 9px;
    padding: 10px 20px;
    font-weight: 600;
    width: 100%;
}

div.stButton > button:hover {
    background: linear-gradient(90deg, #6D28D9, #4338CA);
    color: white;
    border: none;
}

.stTextInput input, .stSelectbox div[data-baseweb="select"] {
    background-color: #151D30;
    color: white;
}

hr {
    border-color: #273449;
}

</style>
""", unsafe_allow_html=True)


# ==========================================
# SIDEBAR
# ==========================================

with st.sidebar:

    st.markdown('<div class="brand">⚡ VendorFlow AI</div>',
                unsafe_allow_html=True)

    st.markdown(
        '<div class="brand-subtitle">INTELLIGENT OPERATIONS</div>',
        unsafe_allow_html=True
    )

    st.markdown("---")

    st.caption("WORKSPACE")

    page = st.radio(
        "Navigation",
        [
            "Overview",
            "Vendor Applications",
            "New Vendor",
            "Live Verification",
            "Reports"
        ],
        label_visibility="collapsed"
    )

    st.markdown("---")

    st.markdown("### 🤖 AI Engine")

    st.markdown(
        '<p style="color:#34D399;font-size:13px;">● System Online</p>',
        unsafe_allow_html=True
    )

    st.markdown("---")

    st.caption("VENDORFLOW AI  ·  VERSION 1.0")


# ==========================================
# OVERVIEW DASHBOARD
# ==========================================

if page == "Overview":

    st.markdown(
        '<div class="main-title">Dashboard Overview</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="subtitle">Monitor vendor onboarding and automated verification.</div>',
        unsafe_allow_html=True
    )

    # Demo metrics - database integration comes later

    col1, col2, col3, col4 = st.columns(4)

    metrics = [
        ("TOTAL VENDORS", "128", "🏢"),
        ("APPROVED", "86", "✅"),
        ("PENDING", "29", "⏳"),
        ("REJECTED", "13", "❌")
    ]

    for col, metric in zip(
        [col1, col2, col3, col4], metrics
    ):

        with col:

            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-icon">{metric[2]}</div>
                <div class="metric-label">{metric[0]}</div>
                <div class="metric-value">{metric[1]}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown(
        '<div class="section-title">📊 Onboarding Analytics</div>',
        unsafe_allow_html=True
    )

    chart_col, info_col = st.columns([2, 1])

    with chart_col:

        fig = go.Figure()

        fig.add_trace(go.Bar(
            x=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            y=[12, 18, 10, 25, 20, 15, 28],
            marker=dict(
                color=[
                    "#7C3AED",
                    "#8B5CF6",
                    "#6366F1",
                    "#A78BFA",
                    "#7C3AED",
                    "#6366F1",
                    "#8B5CF6"
                ],
                line=dict(width=0)
            )
        ))

        fig.update_layout(
            title="Weekly Vendor Submissions",
            paper_bgcolor="#111827",
            plot_bgcolor="#111827",
            font=dict(color="#CBD5E1"),
            margin=dict(l=20, r=20, t=50, b=20),
            height=300,
            xaxis=dict(showgrid=False),
            yaxis=dict(
                showgrid=True,
                gridcolor="#263248"
            )
        )

        st.plotly_chart(fig, use_container_width=True)

    with info_col:

        st.markdown("""
        <div class="info-card">
            <h4>Approval Rate</h4>
            <h1 style="color:#A78BFA;">67.2%</h1>
            <p style="color:#94A3B8;">Of submitted vendors approved</p>
            <hr>
            <p>🟢 Approved: 86</p>
            <p>🟡 Pending: 29</p>
            <p>🔴 Rejected: 13</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown(
        '<div class="section-title">🕒 Recent Applications</div>',
        unsafe_allow_html=True
    )

    st.dataframe(
        {
            "Vendor": [
                "ABC Technologies",
                "Nova Solutions",
                "TechSphere Pvt Ltd",
                "Digital Works"
            ],
            "Date": [
                "10 Nov 2026",
                "10 Nov 2026",
                "09 Nov 2026",
                "09 Nov 2026"
            ],
            "Status": [
                "Approved",
                "Pending",
                "Approved",
                "Rejected"
            ]
        },
        use_container_width=True,
        hide_index=True
    )

    st.caption(
        "Demo data for UI development. "
        "Live database integration will replace these values."
    )


# ==========================================
# VENDOR APPLICATIONS
# ==========================================

elif page == "Vendor Applications":

    st.markdown(
        '<div class="main-title">Vendor Applications</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="subtitle">Manage and review vendor submissions.</div>',
        unsafe_allow_html=True
    )

    search = st.text_input(
        "🔍 Search vendor",
        placeholder="Enter vendor name..."
    )

    status = st.selectbox(
        "Filter by status",
        ["All", "Approved", "Pending", "Rejected"]
    )

    st.info(
        "The application database will be connected in our next development phase."
    )


# ==========================================
# NEW VENDOR
# ==========================================

elif page == "New Vendor":

    st.markdown(
        '<div class="main-title">Register New Vendor</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="subtitle">Submit vendor information and supporting documents.</div>',
        unsafe_allow_html=True
    )

    with st.form("vendor_form"):

        st.subheader("🏢 Company Information")

        company = st.text_input("Company Legal Name")

        country = st.selectbox(
            "Country",
            ["India", "United States", "United Kingdom", "Other"]
        )

        email = st.text_input("Business Email")

        phone = st.text_input("Contact Number")

        st.divider()

        st.subheader("📑 Tax Information")

        pan = st.text_input("PAN Number")

        gst = st.text_input("GST Number")

        st.divider()

        st.subheader("🏦 Banking Information")

        bank_name = st.text_input("Bank Account Holder Name")

        account = st.text_input("Bank Account Number")

        ifsc = st.text_input("IFSC Code")

        st.divider()

        st.subheader("📂 Supporting Documents")

        pan_file = st.file_uploader(
            "PAN Document",
            type=["pdf", "png", "jpg", "jpeg"]
        )

        gst_file = st.file_uploader(
            "GST Certificate",
            type=["pdf", "png", "jpg", "jpeg"]
        )

        cheque_file = st.file_uploader(
            "Cancelled Cheque",
            type=["pdf", "png", "jpg", "jpeg"]
        )

        submit = st.form_submit_button(
            "Submit Vendor Application 🚀"
        )

        if submit:

            if not company or not email or not pan:
                st.error("Please complete the mandatory fields.")

            else:
                st.success(
                    "Vendor information received successfully!"
                )

                st.info(
                    "Automated verification will be integrated next."
                )


# ==========================================
# LIVE VERIFICATION
# ==========================================

elif page == "Live Verification":

    st.markdown(
        '<div class="main-title">Live Verification Engine</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="subtitle">Monitor automated vendor verification.</div>',
        unsafe_allow_html=True
    )

    st.markdown("""
    <div class="info-card">
        <h3>🤖 AI Verification Engine</h3>
        <p style="color:#94A3B8;">
        The engine will execute multiple validation stages
        and generate an explainable onboarding decision.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.write("")

    st.info(
        "Live execution stages will be connected to the actual "
        "verification engine in the next phase."
    )


# ==========================================
# REPORTS
# ==========================================

elif page == "Reports":

    st.markdown(
        '<div class="main-title">Verification Reports</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="subtitle">Review decisions and verification outcomes.</div>',
        unsafe_allow_html=True
    )

    st.info(
        "Detailed verification reports will be generated "
        "after connecting the decision engine."
    )
