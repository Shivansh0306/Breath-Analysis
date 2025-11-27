import streamlit as st
import pandas as pd
import numpy as np
import shap
from streamlit_shap import st_shap
from src.inference import load_model_file, get_prediction
from src.utils import create_pdf_report

st.set_page_config(page_title="Analysis", layout="wide")

if not st.session_state.get('logged_in', False):
    st.warning("Please login first.")
    st.stop()

st.title("🫁 Clinical Breath Analysis")

# 1. Model Selector
st.sidebar.header("⚙️ Configuration")
model_choice = st.sidebar.selectbox(
    "Select Model Architecture",
    ["XGBoost", "Random_Forest", "SVM", "Logistic_Regression"]
)

# Load Model
try:
    model = load_model_file(f"models/model_{model_choice}.pkl")
except Exception:
    st.error("Model not found. Run 'src/train_multimodel.py' first.")
    st.stop()

# 2. Input
with st.expander("📝 Patient & Sensor Data", expanded=True):
    c1, c2 = st.columns(2)
    p_name = c1.text_input("Patient Name", "Jane Doe")
    p_age = c2.number_input("Age", 0, 100, 55)
    uploaded_file = st.file_uploader("Upload Breath Sensor CSV (1 Row)", type=['csv'])

if uploaded_file:
    input_df = pd.read_csv(uploaded_file)
    
    if st.button("Run AI Diagnosis", type="primary"):
        # Prediction
        label, prob = get_prediction(model, input_df)
        
        col1, col2 = st.columns(2)
        col1.metric("Diagnosis", label)
        col2.metric("Risk Probability", f"{prob:.2%}")

        # --- ROBUST SHAP ---
        st.divider()
        st.subheader("🔬 AI Explainability (SHAP)")
        
        try:
            # Extract Pipeline
            pre = model.named_steps['pre']
            sel = model.named_steps['sel']
            clf = model.named_steps['clf']
            
            # Transform Data
            X_pre = pre.transform(input_df)
            X_sel = sel.transform(X_pre)
            
            # Names
            all_names = pre.get_feature_names_out()
            mask = sel.get_support()
            sel_names = np.array(all_names)[mask]
            
            # Compute
            masker = shap.maskers.Independent(data=X_sel)
            # SVM/LogReg use Linear, Tree models use TreeExplainer
            if model_choice in ["XGBoost", "Random_Forest"]:
                explainer = shap.TreeExplainer(clf)
            else:
                explainer = shap.LinearExplainer(clf, masker)
                
            shap_obj = explainer(X_sel)
            
            # Handle Base Value
            base = explainer.expected_value
            if isinstance(base, (list, np.ndarray)) and len(base) > 1:
                base = base[1]
                
            # Handle SHAP Values dimensions
            s_vals = shap_obj.values
            if s_vals.ndim == 3:
                s_vals = s_vals[:, :, 1]
                
            # Plot
            st_shap(shap.force_plot(
                base, s_vals[0], X_sel[0], feature_names=sel_names
            ), height=150)
            
            # Extract Top Features
            vals = np.abs(s_vals[0])
            top_ids = np.argsort(vals)[-5:][::-1]
            top_feats = {sel_names[i]: vals[i] for i in top_ids}

        except Exception as e:
            st.warning(f"SHAP Visualization unavailable for this model: {e}")
            top_feats = {}

        # --- PDF REPORT ---
        st.divider()
        pdf = create_pdf_report(p_name, p_age, prob, label, top_feats, model_choice)
        st.download_button("📄 Download Clinical Report", data=pdf, file_name="report.pdf")