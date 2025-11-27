import importlib.metadata
with open("versions.txt", "w") as f:
    for pkg in ['scikit-learn', 'xgboost', 'pandas', 'joblib']:
        try:
            v = importlib.metadata.version(pkg)
            f.write(f"{pkg}=={v}\n")
        except:
            f.write(f"{pkg} not found\n")
