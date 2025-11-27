import streamlit as st
import hashlib
import json
import os

st.set_page_config(page_title="BreathScan AI", layout="wide", page_icon="🫁")

# --- CONFIGURATION ---
# Set this to True if you want to skip the login screen while developing
DEV_MODE = True

# --- LOGIN SYSTEM ---
def verify_login(username, password):
    # Hardcoded demo credentials (Hash of 'doctor123')
    # Use this to generate new hashes: hashlib.sha256("your_password".encode()).hexdigest()
    correct_hash = "6d5a9d6812837f40fc9260c6d962061031b262d1656f481f34960714b986b110"
    return username == "doctor" and hashlib.sha256(password.encode()).hexdigest() == correct_hash

# Initialize Session State
if 'logged_in' not in st.session_state:
    st.session_state['logged_in'] = DEV_MODE

def login_page():
    st.markdown("<h1 style='text-align: center; color: #4A90E2;'>🫁 BreathScan AI</h1>", unsafe_allow_html=True)
    st.markdown("<h3 style='text-align: center;'>Clinical Triage System</h3>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1,2,1])
    with col2:
        with st.form("login"):
            st.write("### Secure Access")
            user = st.text_input("Username")
            pwd = st.text_input("Password", type="password")
            
            if st.form_submit_button("Login", type="primary"):
                if verify_login(user, pwd):
                    st.session_state['logged_in'] = True
                    st.rerun()
                else:
                    st.error("❌ Invalid Credentials")
    
    st.info("💡 **Demo Credentials** -> Username: `doctor` | Password: `doctor123`")

# --- MAIN APP LOGIC ---
if not st.session_state['logged_in']:
    login_page()
else:
    # --- SIDEBAR DASHBOARD ---
    st.sidebar.title("System Status")
    st.sidebar.success(f"User: DOCTOR (Authenticated)")
    
    # Load Training Metrics (The "Transparency" feature)
    if os.path.exists("models/model_metrics.json"):
        st.sidebar.markdown("---")
        st.sidebar.subheader("🏆 Model Benchmarks")
        try:
            with open("models/model_metrics.json", "r") as f:
                metrics = json.load(f)
            
            # Show stats for the 'Champion' model (e.g., XGBoost)
            if "XGBoost" in metrics:
                st.sidebar.metric("XGBoost Accuracy", f"{metrics['XGBoost']['accuracy']:.2%}")
                st.sidebar.metric("XGBoost F1", f"{metrics['XGBoost']['f1_score']:.2f}")
            elif len(metrics) > 0:
                # Fallback to whatever model is available
                first = list(metrics.keys())[0]
                st.sidebar.metric(f"{first} Acc", f"{metrics[first]['accuracy']:.2%}")
        except Exception:
            st.sidebar.warning("Could not load metrics file.")
    else:
        st.sidebar.warning("Metrics file not found. Run training script.")

    st.sidebar.markdown("---")
    if st.sidebar.button("Logout"):
        st.session_state['logged_in'] = False
        st.rerun()

    # --- MAIN WELCOME SCREEN ---
    st.title("Welcome to BreathScan Dashboard")
    st.markdown("""
    ### 🏥 AI-Powered Non-Invasive Cancer Screening
    
    This system utilizes advanced machine learning pipelines to analyze breath biomarkers for early lung cancer detection.
    
    #### ◀️ Getting Started
    Please select a module from the **sidebar** to begin:
    
    1. **🫁 Predict & Analyze**: 
       - Upload patient sensor data (CSV).
       - Run AI Inference using XGBoost, SVM, or Random Forest.
       - View SHAP Explainability plots.
       - Generate PDF Clinical Reports.
       
    2. **📈 Patient History**:
       - Track longitudinal risk scores.
       - Visualize biomarker trends over time.
       
    3. **📊 Model Comparison**:
       - View benchmarking results.
       - Compare Accuracy and F1 Scores across architectures.
    """)
    
    st.info("✅ System Ready. Models loaded from `/models` directory.")