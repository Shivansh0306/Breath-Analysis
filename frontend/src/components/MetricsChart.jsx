import React from 'react';
import { motion } from 'framer-motion';

export default function MetricsChart({ metrics }) {
    if (!metrics || Object.keys(metrics).length === 0) {
        return <div style={{ color: '#4a4e69' }}>No metrics available. Train models first.</div>;
    }

    return (
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {Object.entries(metrics).map(([modelName, scores], index) => (
                <motion.div
                    key={modelName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}
                >
                    <h3 style={{ color: '#4a4e69', marginTop: 0 }}>{modelName.replace('_', ' ')}</h3>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4a4e69' }}>
                            <span>Accuracy</span>
                            <strong>{(scores.accuracy * 100).toFixed(1)}%</strong>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${scores.accuracy * 100}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                style={{ height: '100%', background: 'var(--sky-blue)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4a4e69' }}>
                            <span>F1 Score</span>
                            <strong>{scores.f1_score.toFixed(2)}</strong>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${scores.f1_score * 100}%` }} // Assuming F1 is 0-1, scaling to % for bar
                                transition={{ duration: 1, delay: 0.7 }}
                                style={{ height: '100%', background: 'var(--baby-pink)' }}
                            />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
