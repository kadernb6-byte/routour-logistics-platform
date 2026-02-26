import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Building2, Eye, EyeOff, Truck, Package } from 'lucide-react';
import logo from '../assets/logo.svg';

const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        companyName: '',
        role: 'shipper',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signup(formData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-fadeInUp">
                {/* Logo */}
                <div className="auth-logo">
                    <img src={logo} alt="Routeur" className="auth-logo-image" />
                </div>

                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Get started with freight logistics</p>

                {/* Error message */}
                {error && (
                    <div
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--border-radius-md)',
                            padding: '12px 16px',
                            marginBottom: '16px',
                            color: 'var(--color-danger-light)',
                            fontSize: 'var(--font-size-sm)',
                        }}
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Role Toggle */}
                    <div style={{ marginBottom: '4px' }}>
                        <label className="form-label">I am a</label>
                    </div>
                    <div className="role-toggle">
                        <button
                            type="button"
                            className={`role-toggle-btn ${formData.role === 'shipper' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'shipper' })}
                            id="role-shipper"
                        >
                            <Package size={16} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />
                            Shipper
                        </button>
                        <button
                            type="button"
                            className={`role-toggle-btn ${formData.role === 'carrier' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'carrier' })}
                            id="role-carrier"
                        >
                            <Truck size={16} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />
                            Carrier
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-company">Company name</label>
                        <div style={{ position: 'relative' }}>
                            <Building2
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                }}
                            />
                            <input
                                id="signup-company"
                                name="companyName"
                                type="text"
                                className="form-input"
                                placeholder="Your company name"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '44px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-email">Email address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                }}
                            />
                            <input
                                id="signup-email"
                                name="email"
                                type="email"
                                className="form-input"
                                placeholder="you@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '44px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                }}
                            />
                            <input
                                id="signup-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Min. 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading}
                        id="signup-submit"
                        style={{ marginTop: '8px' }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
