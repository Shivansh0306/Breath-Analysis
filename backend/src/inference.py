import joblib

def load_model_file(path):
    return joblib.load(path)

def get_prediction(_model, input_df):
    """
    Returns (Label, Probability)
    """
    # Prediction (0 or 1)
    pred_idx = _model.predict(input_df)[0]
    
    # Map back to string
    label = "High Risk (Cancer)" if pred_idx == 1 else "Low Risk (Control)"
    
    # Probability
    if hasattr(_model, "predict_proba"):
        probs = _model.predict_proba(input_df)
        cancer_prob = probs[:, 1][0]
    else:
        cancer_prob = float(pred_idx)
        
    return label, cancer_prob