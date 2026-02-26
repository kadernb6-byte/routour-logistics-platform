import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../services/api';
import {
    User, Lock, Mail, Phone, Shield, AlertTriangle,
    Save, Eye, EyeOff, Check, X, Loader2, Building2,
    Calendar, ChevronRight,
} from 'lucide-react';
import './Settings.css';

export default function Settings() {
    const { user, logout, updateUser } = useAuth();
    const { t } = useLang();

    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    // Profile form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [profileMsg, setProfileMsg] = useState(null);
    const [profileSaving, setProfileSaving] = useState(false);

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState(null);
    const [passwordSaving, setPasswordSaving] = useState(false);

    // Email form
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [showEmailPw, setShowEmailPw] = useState(false);
    const [emailMsg, setEmailMsg] = useState(null);
    const [emailSaving, setEmailSaving] = useState(false);

    // Deactivate
    const [deactivatePassword, setDeactivatePassword] = useState('');
    const [deactivateConfirm, setDeactivateConfirm] = useState(false);
    const [showDeactivatePw, setShowDeactivatePw] = useState(false);
    const [deactivateMsg, setDeactivateMsg] = useState(null);
    const [deactivating, setDeactivating] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/settings/profile');
            const p = res.data.data || res.data;
            setProfile(p);
            setFirstName(p.first_name || '');
            setLastName(p.last_name || '');
            setPhone(p.phone || '');
        } catch (err) {
            console.error('Failed to load profile', err);
        } finally {
            setLoading(false);
        }
    };

    // ── Save Profile ──
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileMsg(null);
        try {
            await api.put('/settings/profile', {
                firstName, lastName, phone,
            });
            setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
            // Re-fetch profile so the info card updates
            await fetchProfile();
            // Update stored user in localStorage/context
            if (updateUser) {
                updateUser({ ...user, firstName, lastName, phone });
            }
        } catch (err) {
            setProfileMsg({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update profile',
            });
        } finally {
            setProfileSaving(false);
        }
    };

    // ── Change Password ──
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }
        setPasswordSaving(true);
        setPasswordMsg(null);
        try {
            await api.put('/settings/password', { currentPassword, newPassword });
            setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMsg({
                type: 'error',
                text: err.response?.data?.message || 'Failed to change password',
            });
        } finally {
            setPasswordSaving(false);
        }
    };

    // ── Change Email ──
    const handleChangeEmail = async (e) => {
        e.preventDefault();
        if (!newEmail || !emailPassword) {
            setEmailMsg({ type: 'error', text: 'Please fill all fields' });
            return;
        }
        setEmailSaving(true);
        setEmailMsg(null);
        try {
            await api.put('/settings/email', { newEmail, password: emailPassword });
            setEmailMsg({ type: 'success', text: 'Email changed successfully! Please log in again.' });
            setNewEmail('');
            setEmailPassword('');
            setTimeout(() => logout(), 2000);
        } catch (err) {
            setEmailMsg({
                type: 'error',
                text: err.response?.data?.message || 'Failed to change email',
            });
        } finally {
            setEmailSaving(false);
        }
    };

    // ── Deactivate Account ──
    const handleDeactivate = async () => {
        if (!deactivateConfirm || !deactivatePassword) return;
        setDeactivating(true);
        setDeactivateMsg(null);
        try {
            await api.delete('/settings/account', { data: { password: deactivatePassword } });
            setDeactivateMsg({ type: 'success', text: 'Account deactivated. Logging out...' });
            setTimeout(() => logout(), 2000);
        } catch (err) {
            setDeactivateMsg({
                type: 'error',
                text: err.response?.data?.message || 'Failed to deactivate',
            });
        } finally {
            setDeactivating(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Loader2 size={40} className="spinner" />
                <p>Loading settings...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
    ];

    return (
        <div className="settings-page animate-fadeIn">
            <div className="settings-header">
                <h1>⚙️ Settings</h1>
                <p>Manage your account, security, and preferences</p>
            </div>

            <div className="settings-layout">
                {/* ── Tab Navigation ── */}
                <nav className="settings-nav">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                                <ChevronRight size={16} className="settings-nav-arrow" />
                            </button>
                        );
                    })}
                </nav>

                {/* ── Tab Content ── */}
                <div className="settings-content">
                    {/* ═══ PROFILE TAB ═══ */}
                    {activeTab === 'profile' && (
                        <div className="settings-section animate-fadeIn">
                            {/* Account Info Card */}
                            <div className="settings-card settings-info-card">
                                <div className="settings-avatar">
                                    {(firstName || user?.email || '?')[0].toUpperCase()}
                                </div>
                                <div className="settings-info-details">
                                    <h3>{firstName} {lastName}</h3>
                                    <span className="settings-role-badge">
                                        {user?.role === 'carrier' ? '🚛 Carrier' : '📦 Shipper'}
                                    </span>
                                    <div className="settings-meta">
                                        <span><Mail size={14} /> {profile?.email}</span>
                                        <span><Building2 size={14} /> {profile?.company_name}</span>
                                        <span><Calendar size={14} /> Member since {new Date(profile?.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Profile Form */}
                            <div className="settings-card">
                                <h2 className="settings-card-title">
                                    <User size={20} /> Personal Information
                                </h2>
                                <p className="settings-card-desc">Update your name and contact details</p>

                                {profileMsg && (
                                    <div className={`settings-msg settings-msg-${profileMsg.type}`}>
                                        {profileMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
                                        {profileMsg.text}
                                    </div>
                                )}

                                <form onSubmit={handleSaveProfile} className="settings-form">
                                    <div className="settings-form-row">
                                        <div className="settings-field">
                                            <label>First Name</label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Enter first name"
                                                className="settings-input"
                                            />
                                        </div>
                                        <div className="settings-field">
                                            <label>Last Name</label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Enter last name"
                                                className="settings-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="settings-field">
                                        <label><Phone size={14} /> Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+213 XXX XXX XXX"
                                            className="settings-input"
                                        />
                                    </div>

                                    <div className="settings-field">
                                        <label><Mail size={14} /> Email Address</label>
                                        <input
                                            type="email"
                                            value={profile?.email || ''}
                                            disabled
                                            className="settings-input settings-input-disabled"
                                        />
                                        <span className="settings-field-hint">
                                            To change your email, go to the Security tab
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        className="settings-btn settings-btn-primary"
                                        disabled={profileSaving}
                                    >
                                        {profileSaving ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                                        {profileSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ═══ SECURITY TAB ═══ */}
                    {activeTab === 'security' && (
                        <div className="settings-section animate-fadeIn">
                            {/* Change Password */}
                            <div className="settings-card">
                                <h2 className="settings-card-title">
                                    <Lock size={20} /> Change Password
                                </h2>
                                <p className="settings-card-desc">Use a strong password with at least 6 characters</p>

                                {passwordMsg && (
                                    <div className={`settings-msg settings-msg-${passwordMsg.type}`}>
                                        {passwordMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
                                        {passwordMsg.text}
                                    </div>
                                )}

                                <form onSubmit={handleChangePassword} className="settings-form">
                                    <div className="settings-field">
                                        <label>Current Password</label>
                                        <div className="settings-input-group">
                                            <input
                                                type={showCurrentPw ? 'text' : 'password'}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                                className="settings-input"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="settings-input-toggle"
                                                onClick={() => setShowCurrentPw(!showCurrentPw)}
                                            >
                                                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="settings-form-row">
                                        <div className="settings-field">
                                            <label>New Password</label>
                                            <div className="settings-input-group">
                                                <input
                                                    type={showNewPw ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="New password"
                                                    className="settings-input"
                                                    required
                                                    minLength={6}
                                                />
                                                <button
                                                    type="button"
                                                    className="settings-input-toggle"
                                                    onClick={() => setShowNewPw(!showNewPw)}
                                                >
                                                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="settings-field">
                                            <label>Confirm New Password</label>
                                            <div className="settings-input-group">
                                                <input
                                                    type={showConfirmPw ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm password"
                                                    className="settings-input"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="settings-input-toggle"
                                                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                                                >
                                                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password strength indicator */}
                                    {newPassword && (
                                        <div className="password-strength">
                                            <div className="password-strength-bar">
                                                <div
                                                    className={`password-strength-fill ${newPassword.length >= 12 ? 'strong' :
                                                        newPassword.length >= 8 ? 'medium' : 'weak'
                                                        }`}
                                                    style={{
                                                        width: newPassword.length >= 12 ? '100%' :
                                                            newPassword.length >= 8 ? '66%' : '33%'
                                                    }}
                                                />
                                            </div>
                                            <span className={
                                                newPassword.length >= 12 ? 'strong' :
                                                    newPassword.length >= 8 ? 'medium' : 'weak'
                                            }>
                                                {newPassword.length >= 12 ? 'Strong' :
                                                    newPassword.length >= 8 ? 'Medium' : 'Weak'}
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="settings-btn settings-btn-primary"
                                        disabled={passwordSaving}
                                    >
                                        {passwordSaving ? <Loader2 size={16} className="spinner" /> : <Lock size={16} />}
                                        {passwordSaving ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>

                            {/* Change Email */}
                            <div className="settings-card">
                                <h2 className="settings-card-title">
                                    <Mail size={20} /> Change Email
                                </h2>
                                <p className="settings-card-desc">
                                    Current email: <strong>{profile?.email}</strong>. You will be logged out after changing.
                                </p>

                                {emailMsg && (
                                    <div className={`settings-msg settings-msg-${emailMsg.type}`}>
                                        {emailMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
                                        {emailMsg.text}
                                    </div>
                                )}

                                <form onSubmit={handleChangeEmail} className="settings-form">
                                    <div className="settings-form-row">
                                        <div className="settings-field">
                                            <label>New Email Address</label>
                                            <input
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="new@email.com"
                                                className="settings-input"
                                                required
                                            />
                                        </div>
                                        <div className="settings-field">
                                            <label>Confirm Password</label>
                                            <div className="settings-input-group">
                                                <input
                                                    type={showEmailPw ? 'text' : 'password'}
                                                    value={emailPassword}
                                                    onChange={(e) => setEmailPassword(e.target.value)}
                                                    placeholder="Your password"
                                                    className="settings-input"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="settings-input-toggle"
                                                    onClick={() => setShowEmailPw(!showEmailPw)}
                                                >
                                                    {showEmailPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="settings-btn settings-btn-secondary"
                                        disabled={emailSaving}
                                    >
                                        {emailSaving ? <Loader2 size={16} className="spinner" /> : <Mail size={16} />}
                                        {emailSaving ? 'Updating...' : 'Update Email'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ═══ DANGER ZONE ═══ */}
                    {activeTab === 'danger' && (
                        <div className="settings-section animate-fadeIn">
                            <div className="settings-card settings-card-danger">
                                <h2 className="settings-card-title settings-danger-title">
                                    <AlertTriangle size={20} /> Danger Zone
                                </h2>
                                <p className="settings-card-desc">
                                    Once you deactivate your account, you will lose access to all data.
                                    This action can only be reversed by contacting support.
                                </p>

                                {deactivateMsg && (
                                    <div className={`settings-msg settings-msg-${deactivateMsg.type}`}>
                                        {deactivateMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
                                        {deactivateMsg.text}
                                    </div>
                                )}

                                <div className="settings-form">
                                    <div className="settings-field">
                                        <label>Enter your password to confirm</label>
                                        <div className="settings-input-group">
                                            <input
                                                type={showDeactivatePw ? 'text' : 'password'}
                                                value={deactivatePassword}
                                                onChange={(e) => setDeactivatePassword(e.target.value)}
                                                placeholder="Your password"
                                                className="settings-input"
                                            />
                                            <button
                                                type="button"
                                                className="settings-input-toggle"
                                                onClick={() => setShowDeactivatePw(!showDeactivatePw)}
                                            >
                                                {showDeactivatePw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <label className="settings-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={deactivateConfirm}
                                            onChange={(e) => setDeactivateConfirm(e.target.checked)}
                                        />
                                        <span>I understand that this action will deactivate my account</span>
                                    </label>

                                    <button
                                        className="settings-btn settings-btn-danger"
                                        disabled={!deactivateConfirm || !deactivatePassword || deactivating}
                                        onClick={handleDeactivate}
                                    >
                                        {deactivating ? <Loader2 size={16} className="spinner" /> : <AlertTriangle size={16} />}
                                        {deactivating ? 'Deactivating...' : 'Deactivate Account'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
