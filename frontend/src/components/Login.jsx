import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                onLogin(data.user);
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}
            >
                <h1 style={{ color: 'var(--baby-pink)', marginBottom: '0.5rem' }}>🫁 BreathScan AI</h1>
                <h3 style={{ marginTop: 0, opacity: 0.8 }}>Clinical Triage System</h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <div style={{ color: '#ff6b6b', fontSize: '0.9em' }}>{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', fontSize: '0.8em', opacity: 0.7 }}>
                    Demo: doctor / doctor123
                </div>
            </motion.div>
        </div>
    );
}
