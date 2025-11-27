# 🫁 BreathScan AI

**BreathScan AI** is a non-invasive machine learning system designed to detect early lung cancer indicators using breath sensor data.  
It combines multi-model ML pipelines, explainable AI, and clinical-grade reporting, packaged inside an easy-to-use Streamlit interface with secure role-based access.

---

## 🌐 Live Demo

🔗 **Deployed Application:** https://breath-analysis-gvr8.vercel.app/

---

## 🌟 Features

### 🔧 Multi-Model Architecture
- Supports XGBoost, Random Forest, SVM, and more.
- Swappable backend models for experimentation.
- Comparative performance evaluation.

### 🧠 Explainable AI
- Integrated SHAP analysis for transparent predictions.
- Feature-level attribution for each patient sample.

### 📄 Clinical Reporting
- Auto-generates PDF medical reports with:
  - Prediction results  
  - SHAP feature plots  
  - Patient metadata

### 🔐 Security
- Built-in authentication with role-based access control (RBAC).
- Default doctor account provided.

### 🖥️ Streamlit Frontend
- Clean dashboard for prediction, analysis, and report export.

---

## 🚀 Setup Instructions

### 1️⃣ Install Dependencies
```bash
pip install -r requirements.txt

