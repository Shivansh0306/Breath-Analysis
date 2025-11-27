import pandas as pd
import joblib
import json
import os
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.feature_selection import SelectKBest, mutual_info_classif
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

# Models
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from xgboost import XGBClassifier

def train_all_models(data_path):
    print("🚀 Starting Multi-Model Training Pipeline...")
    
    # 1. Load Data
    # NOTE: Change 'test_set_fu.csv' to your actual file name
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        print(f"❌ Error: File not found at {data_path}")
        return

    # Identify Target (Last column or specific name)
    target_col = 'label' if 'label' in df.columns else df.columns[-1]
    print(f"🎯 Target Column detected: {target_col}")

    X = df.drop(columns=[target_col])
    # Simple mapping (Adjust if your classes are different)
    y_raw = df[target_col]
    unique_classes = y_raw.unique()
    # Map 'Control' to 0, anything else to 1 (Cancer)
    y = y_raw.apply(lambda x: 0 if 'Control' in str(x) else 1)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 2. Preprocessing
    num_cols = X.select_dtypes(include=['number']).columns
    preprocessor = ColumnTransformer([
        ('num', Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ]), num_cols)
    ])

    # 3. Models Config
    models_config = {
        "Logistic_Regression": LogisticRegression(max_iter=1000),
        "Random_Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='logloss'),
        "SVM": SVC(probability=True, kernel='linear') 
    }
    
    metrics_log = {}

    # 4. Training Loop
    for name, clf in models_config.items():
        print(f"⚙️  Training {name}...")
        pipe = Pipeline([
            ('pre', preprocessor),
            ('sel', SelectKBest(mutual_info_classif, k=200)), # Top 200 features
            ('clf', clf)
        ])
        
        pipe.fit(X_train, y_train)
        
        preds = pipe.predict(X_test)
        metrics_log[name] = {
            "accuracy": accuracy_score(y_test, preds),
            "f1_score": f1_score(y_test, preds, average='macro')
        }
        
        # Save
        joblib.dump(pipe, f"models/model_{name}.pkl")

    # 5. Save Metrics
    with open("models/model_metrics.json", "w") as f:
        json.dump(metrics_log, f)
        
    print("\n🏁 All models trained and saved to /models folder!")

if __name__ == "__main__":
    os.makedirs("models", exist_ok=True)
    # POINT THIS TO YOUR RAW DATA
    train_all_models("data/raw/dataset.csv")