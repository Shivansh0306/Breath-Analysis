import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MetricsChart from './MetricsChart';

export default function Dashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('predict');
    const [file, setFile] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState({});

    useEffect(() => {
        if (activeTab === 'metrics') {
            fetch(`${import.meta.env.VITE_API_URL}/api/metrics`)
                .then(res => res.json())
                .then(data => setMetrics(data))
                .catch(err => console.error("Failed to load metrics", err));
        }
    }, [activeTab]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handlePredict = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setPrediction(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model_name', 'XGBoost'); // Default

        console.log("Using API URL:", import.meta.env.VITE_API_URL);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/predict`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            setPrediction(data);
        } catch (error) {
            console.error("Prediction failed", error);
            setError("Analysis failed. Please check your connection and try again. Ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!prediction) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_name: "John Doe", // Mocked for now
                    age: 45, // Mocked
                    risk_score: prediction.confidence,
                    prediction: prediction.diagnosis,
                    top_features: { "Feature A": 0.5, "Feature B": 0.3 }, // Mocked
                    model_name: "XGBoost"
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'BreathScan_Report.pdf';
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (error) {
            console.error("Download failed", error);
        }
    };

    const navItems = [
        { id: 'predict', label: '🫁 Analysis' },
        { id: 'metrics', label: '📊 Benchmarks' },
        { id: 'models', label: '🤖 Models' },
        { id: 'training', label: '🧠 Pipeline' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '90vh', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Top Navigation */}
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-panel"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 2rem',
                    marginBottom: '2rem',
                    borderRadius: '20px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ margin: 0, color: '#4a4e69' }}>BreathScan AI</h2>
                    <span style={{ background: 'var(--baby-pink)', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8em', color: 'white' }}>
                        {user}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                background: activeTab === item.id ? 'var(--sky-blue)' : 'transparent',
                                color: activeTab === item.id ? 'white' : '#4a4e69',
                                boxShadow: activeTab === item.id ? '0 4px 10px rgba(162, 210, 255, 0.4)' : 'none',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '12px'
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                    <button onClick={onLogout} style={{ background: '#ffb3c1', color: '#fff' }}>Logout</button>
                </div>
            </motion.nav>

            {/* Main Content Area */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-panel"
                style={{ flexGrow: 1, overflowY: 'auto', borderRadius: '24px', padding: '3rem' }}
            >
                {activeTab === 'predict' && (
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <h1 style={{ color: '#4a4e69', marginBottom: '2rem' }}>Start New Diagnosis</h1>

                        <div
                            style={{
                                border: '3px dashed var(--sky-blue)',
                                padding: '4rem',
                                borderRadius: '24px',
                                background: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onDragOver={(e) => e.target.style.background = 'rgba(255,255,255,0.6)'}
                            onDragLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.4)'}
                        >
                            <input type="file" onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} id="file-upload" />
                            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📂</div>
                                <h3 style={{ margin: 0, color: '#4a4e69' }}>{file ? file.name : "Drag & Drop or Click to Upload CSV"}</h3>
                                <p style={{ color: '#9a8c98' }}>Supported format: .csv (Breath Sensor Data)</p>
                            </label>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <button
                                onClick={handlePredict}
                                disabled={!file || loading}
                                style={{
                                    fontSize: '1.2rem',
                                    padding: '1rem 3rem',
                                    background: loading ? '#ccc' : 'var(--sky-blue)'
                                }}
                            >
                                {loading ? 'Running AI Inference...' : 'Run Analysis'}
                            </button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ marginTop: '2rem', padding: '1rem', background: '#ffe3e3', color: '#e03131', borderRadius: '12px' }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {prediction && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{ marginTop: '3rem', padding: '2rem', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                            >
                                <h2 style={{ color: '#4a4e69' }}>Analysis Results</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                                    <div style={{ padding: '2rem', background: prediction.diagnosis.includes('High') ? '#ffc8dd' : '#bde0fe', borderRadius: '16px' }}>
                                        <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#4a4e69' }}>Diagnosis</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4a4e69' }}>
                                            {prediction.diagnosis}
                                        </div>
                                    </div>
                                    <div style={{ padding: '2rem', background: '#f0efeb', borderRadius: '16px' }}>
                                        <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#4a4e69' }}>Confidence Score</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4a4e69' }}>
                                            {(prediction.confidence * 100).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <button
                                        onClick={handleDownloadReport}
                                        style={{ background: 'var(--thistle)', color: '#4a4e69' }}
                                    >
                                        📄 Download Clinical Report
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {activeTab === 'metrics' && (
                    <div>
                        <h2 style={{ color: '#4a4e69', marginBottom: '2rem' }}>Model Performance Benchmarks</h2>
                        <MetricsChart metrics={metrics} />
                    </div>
                )}

                {activeTab === 'models' && (
                    <div>
                        <h2 style={{ color: '#4a4e69', marginBottom: '2rem', textAlign: 'center' }}>AI Model Architectures</h2>
                        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderTop: '6px solid var(--sky-blue)' }}
                            >
                                <h3 style={{ color: 'var(--sky-blue)', marginTop: 0 }}>XGBoost</h3>
                                <div style={{ fontSize: '0.9em', color: '#999', marginBottom: '1rem' }}>Extreme Gradient Boosting</div>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>
                                    An optimized distributed gradient boosting library designed to be highly efficient, flexible and portable.
                                    In BreathScan, it excels at handling tabular sensor data and capturing non-linear relationships between breath biomarkers and disease states.
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -10 }}
                                style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderTop: '6px solid var(--baby-pink)' }}
                            >
                                <h3 style={{ color: 'var(--baby-pink)', marginTop: 0 }}>Random Forest</h3>
                                <div style={{ fontSize: '0.9em', color: '#999', marginBottom: '1rem' }}>Ensemble Learning</div>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>
                                    A meta estimator that fits a number of decision tree classifiers on various sub-samples of the dataset and uses averaging to improve the predictive accuracy and control over-fitting.
                                    It provides excellent robustness against noise in the breath sensor readings.
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -10 }}
                                style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderTop: '6px solid var(--thistle)' }}
                            >
                                <h3 style={{ color: 'var(--thistle)', marginTop: 0 }}>SVM</h3>
                                <div style={{ fontSize: '0.9em', color: '#999', marginBottom: '1rem' }}>Support Vector Machine</div>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>
                                    Supervised learning models with associated learning algorithms that analyze data for classification and regression analysis.
                                    It works by finding the hyperplane that best separates the cancer and control classes in the high-dimensional feature space.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                )}

                {activeTab === 'training' && (
                    <div style={{ color: '#4a4e69', maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '3rem', textAlign: 'center' }}>🧠 Training Pipeline Flow</h2>

                        <div style={{ position: 'relative' }}>
                            {/* Connecting Line */}
                            <div style={{ position: 'absolute', left: '50%', top: '0', bottom: '0', width: '4px', background: '#e0e0e0', transform: 'translateX(-50%)', zIndex: 0 }}></div>

                            {/* Step 1 */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                style={{ display: 'flex', alignItems: 'center', marginBottom: '4rem', position: 'relative', zIndex: 1 }}
                            >
                                <div style={{ flex: 1, textAlign: 'right', paddingRight: '3rem' }}>
                                    <h3 style={{ color: 'var(--sky-blue)', margin: 0 }}>Data Ingestion</h3>
                                    <p style={{ color: '#888' }}>Raw Sensor Data Collection</p>
                                </div>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--sky-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 0 0 8px white' }}>1</div>
                                <div style={{ flex: 1, paddingLeft: '3rem' }}>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#666' }}>
                                            <li>Missing value imputation (Median)</li>
                                            <li>StandardScaler normalization</li>
                                            <li>Label Encoding (Cancer/Control)</li>
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Step 2 */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{ display: 'flex', alignItems: 'center', marginBottom: '4rem', position: 'relative', zIndex: 1 }}
                            >
                                <div style={{ flex: 1, textAlign: 'right', paddingRight: '3rem' }}>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                        <p style={{ margin: 0, color: '#666' }}>
                                            <strong>Mutual Information (SelectKBest)</strong> identifies the top 200 most predictive biomarkers, reducing noise and dimensionality.
                                        </p>
                                    </div>
                                </div>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--baby-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 0 0 8px white' }}>2</div>
                                <div style={{ flex: 1, paddingLeft: '3rem' }}>
                                    <h3 style={{ color: 'var(--baby-pink)', margin: 0 }}>Feature Selection</h3>
                                    <p style={{ color: '#888' }}>Dimensionality Reduction</p>
                                </div>
                            </motion.div>

                            {/* Step 3 */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                style={{ display: 'flex', alignItems: 'center', marginBottom: '4rem', position: 'relative', zIndex: 1 }}
                            >
                                <div style={{ flex: 1, textAlign: 'right', paddingRight: '3rem' }}>
                                    <h3 style={{ color: 'var(--thistle)', margin: 0 }}>Multi-Model Training</h3>
                                    <p style={{ color: '#888' }}>Ensemble Learning</p>
                                </div>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--thistle)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 0 0 8px white' }}>3</div>
                                <div style={{ flex: 1, paddingLeft: '3rem' }}>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                        <p style={{ margin: 0, color: '#666' }}>
                                            Training of XGBoost, Random Forest, and SVM classifiers with hyperparameter tuning for optimal performance.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
