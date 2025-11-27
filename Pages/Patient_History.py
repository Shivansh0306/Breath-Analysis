import streamlit as st
import pandas as pd
import numpy as np

st.title("📈 Longitudinal Patient History")

if not st.session_state.get('logged_in', False):
    st.stop()

# Mock Data
dates = pd.date_range("2024-01-01", periods=6, freq="M")
scores = [0.1, 0.12, 0.15, 0.40, 0.65, 0.82]

df = pd.DataFrame({"Date": dates, "Risk Score": scores})

c1, c2 = st.columns([1,3])
c1.selectbox("Select Patient", ["Jane Doe", "John Smith"])
c1.metric("Status", "Critical", delta="Worsening")

c2.line_chart(df.set_index("Date"))
st.info("Analysis: Patient shows rapid biomarker degradation over Q2.")