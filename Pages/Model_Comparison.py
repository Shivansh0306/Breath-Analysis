import streamlit as st
import json
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

st.title("📊 Model Benchmarking")

if not st.session_state.get('logged_in', False):
    st.stop()

try:
    with open("models/model_metrics.json", "r") as f:
        data = json.load(f)
        
    df = pd.DataFrame(data).T.reset_index().rename(columns={"index": "Model", "accuracy": "Accuracy"})
    
    col1, col2 = st.columns(2)
    col1.dataframe(df)
    
    fig, ax = plt.subplots()
    sns.barplot(data=df, x="Model", y="Accuracy", ax=ax, palette="magma")
    ax.set_ylim(0, 1.0)
    col2.pyplot(fig)
    
except Exception:
    st.error("Metrics not found. Please train models.")