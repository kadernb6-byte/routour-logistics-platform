import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { supabase } from '../services/supabaseClient';
import bcrypt from 'bcryptjs';
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
            if (!user?.id) return;
            const { data, error } = await supabase
                .from('users')
                .select('id, email, first_name, last_name, phone, role, created_at, company_id, companies(name)')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setProfile({
                ...data,
                company_name: data.companies?.name || '',
            });
            setFirstName(data.first_name || '');
            setLastName(data.last_name || '');
            setPhone(data.phone || '');
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
            const { error } = await supabase
                .from('users')
                .update({ first_name: firstName, last_name: lastName, phone })
                .eq('id', user.id);

            if (error) throw error;
            setProfileMsg({ type: 'success', text: t('profileUpdated') });
            await fetchProfile();
            if (updateUser) {
                updateUser({ ...user, firstName, lastName, phone });
            }
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.message || t('profileUpdateFailed') });
        } finally {
            setProfileSaving(false);
        }
    };

    // ── Change Password ──
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'error', text: t('passwordsNoMatch') });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMsg({ type: 'error', text: t('passwordTooShort') });
            return;
        }
        setPasswordSaving(true);
        setPasswordMsg(null);
        try {
            // Verify current password
            const { data: userData } = await supabase
                .from('users')
                .select('password_hash')
                .eq('id', user.id)
                .single();

            const isMatch = await bcrypt.compare(currentPassword, userData.password_hash);
            if (!isMatch) {
                setPasswordMsg({ type: 'error', text: t('wrongPassword') });
                setPasswordSaving(false);
                return;
            }

            // Hash and update
            const hash = await bcrypt.hash(newPassword, 10);
            const { error } = await supabase
                .from('users')
                .update({ password_hash: hash })
                .eq('id', user.id);

            if (error) throw error;
            setPasswordMsg({ type: 'success', text: t('passwordChanged') });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMsg({ type: 'error', text: err.message || t('passwordChangeFailed') });
        } finally {
            setPasswordSaving(false);
        }
    };

    // ── Change Email ──
    const handleChangeEmail = async (e) => {
        e.preventDefault();
        if (!newEmail || !emailPassword) {
            setEmailMsg({ type: 'error', text: t('fillAllFields') });
            return;
        }
        setEmailSaving(true);
        setEmailMsg(null);
        try {
            // Verify password
            const { data: userData } = await supabase
                .from('users')
                .select('password_hash')
                .eq('id', user.id)
                .single();

            const isMatch = await bcrypt.compare(emailPassword, userData.password_hash);
            if (!isMatch) {
                setEmailMsg({ type: 'error', text: t('wrongPassword') });
                setEmailSaving(false);
                return;
            }

            const { error } = await supabase
                .from('users')
                .update({ email: newEmail })
                .eq('id', user.id);

            if (error) throw error;
            setEmailMsg({ type: 'success', text: t('emailChanged') });
            setNewEmail('');
            setEmailPassword('');
            setTimeout(() => logout(), 2000);
        } catch (err) {
            setEmailMsg({ type: 'error', text: err.message || t('emailChangeFailed') });
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
            const { data: userData } = await supabase
                .from('users')
                .select('password_hash')
                .eq('id', user.id)
                .single();

            const isMatch = await bcrypt.compare(deactivatePassword, userData.password_hash);
            if (!isMatch) {
                setDeactivateMsg({ type: 'error', text: t('wrongPassword') });
                setDeactivating(false);
                return;
            }

            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', user.id);

            if (error) throw error;
            setDeactivateMsg({ type: 'success', text: t('accountDeactivated') });
            setTimeout(() => logout(), 2000);
        } catch (err) {
            setDeactivateMsg({ type: 'error', text: err.message || t('deactivateFailed') });
        } finally {
            setDeactivating(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return '—';
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Loader2 size={40} className="spinner" />
                <p>{t('loading')}</p>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: t('profileTab'), icon: User },
        { id: 'security', label: t('securityTab'), icon: Shield },
        { id: 'danger', label: t('dangerZone'), icon: AlertTriangle },
    ];

    return (
        <div className="settings-page animate-fadeIn">
            <div className="settings-header">
                <h1>⚙️ {t('settings')}</h1>
                <p>{t('settingsDesc')}</p>
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
                                        {user?.role === 'carrier' ? `🚛 ${t('carrier')}` : `📦 ${t('shipper')}`}
                                    </span>
                                    <div className="settings-meta">
                                        <span><Mail size={14} /> {profile?.email}</span>
                                        <span><Building2 size={14} /> {profile?.company_name || user?.companyName}</span>
                                        <span><Calendar size={14} /> {t('memberSince')} {formatDate(profile?.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Profile Form */}
                            <div className="settings-card">
                                <h2 className="settings-card-title">
                                    <User size={20} /> {t('personalInfo')}
                                </h2>
                                <p className="settings-card-desc">{t('personalInfoDesc')}</p>

                                {profileMsg && (
                                    <div className={`settings-msg settings-msg-${profileMsg.type}`}>
                                        {profileMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
                                        {profileMsg.text}
                                    </div>
                                )}

                                <form onSubmit={handleSaveProfile} className="settings-form">
                                    <div className="settings-form-row">
                                        <div className="settings-field">
                                            <label>{t('firstName')}</label>
                                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t('firstName')} className="settings-input" />
                                        </div>
                                        <div className="settings-field">
                                            <label>{t('lastName')}</label>
                                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t('lastName')} className="settings-input" />
                                        </div>
                                    </div>

                                    <div className="settings-field">
                                        <label><Phone size={14} /> {t('phone')}</label>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+213 XXX XXX XXX" className="settings-input" />
                                    </div>

                                    <div className="settings-field">
                                        <label><Mail size={14} /> {t('email')}</label>
                                        <input type="email" value={profile?.email || ''} disabled className="settings-input settings-input-disabled" />
                                        <span className="settings-field-hint">{t('emailChangeHint')}</span>
                                    </div>

                                    <button type="submit" className="settings-btn settings-btn-primary" disabled={profileSaving}>
                                        {profileSaving ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                                        {profileSaving ? t('loading') : t('saveChanges')}
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
                                    <Lock size={20} /> {t('changePassword')}
                                </h2>
                                <p className="settings-card-desc">{t('passwordDesc')}</p>

                                {passwordMsg && (
                                    <div className={`settings-msg settings-msg-${passwordMsg.type}`}>
                                        {passwordMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
                                        {passwordMsg.text}
                                    </div>
                                )}

                                <form onSubmit={handleChangePassword} className="settings-form">
                                    <div className="settings-field">
                                        <label>{t('currentPassword')}</label>
                                        <div className="settings-input-group">
                                            <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t('currentPassword')} className="settings-input" required />
                                            <button type="button" className="settings-input-toggle" onClick={() => setShowCurrentPw(!showCurrentPw)}>
                                                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="settings-form-row">
                                        <div className="settings-field">
                                            <label>{t('newPassword')}</label>
                                            <div className="settings-input-group">
                                                <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('newPassword')} className="settings-input" required minLength={6} />
                                                <button type="button" className="settings-input-toggle" onClick={() => setShowNewPw(!showNewPw)}>
                                                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="settings-field">
                                            <label>{t('confirmPassword')}</label>
                                            <div className="settings-input-group">
                                                <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('confirmPassword')} className="settings-input" required />
                                                <button type="button" className="settings-input-toggle" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                                                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {newPassword && (
                                        <div className="password-strength">
                                            <div className="password-strength-bar">
                                                <div className={`password-strength-fill ${newPassword.length >= 12 ? 'strong' : newPassword.length >= 8 ? 'medium' : 'weak'}`}
                                                    style={{ width: newPassword.length >= 12 ? '100%' : newPassword.length >= 8 ? '66%' : '33%' }} />
                                            </div>
                                            <span className={newPassword.length >= 12 ? 'strong' : newPassword.length >= 8 ? 'medium' : 'weak'}>
                                                {newPassword.length >= 12 ? t('strong') : newPassword.length >= 8 ? t('medium') : t('weak')}
                                            </span>
                                        </div>
                                    )}

                                    <button type="submit" className="settings-btn settings-btn-primary" disabled={passwordSaving}>
                                        {passwordSaving ? <Loader2 size={16} className="spinner" /> : <Lock size={16} />}
                                        {passwordSaving ? t('loading') : t('changePassword')}
                                    </button>
                                </form>
                            </div>

                            {/* Change Email */}
                            <div className="settings-card">
                                <h2 className="settings-card-title">
                                    <Mail size={20} /> {t('changeEmail')}
                                </h2>
                                <p className="settings-card-desc">
                                    {t('currentEmailLabel')}: <strong>{profile?.email}</strong>
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
                                            <label>{t('newEmail')}</label>
                                            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@email.com" className="settings-input" required />
                                        </div>
                                        <div className="settings-field">
                                            <label>{t('confirmPassword')}</label>
                                            <div className="settings-input-group">
                                                <input type={showEmailPw ? 'text' : 'password'} value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} placeholder={t('password')} className="settings-input" required />
                                                <button type="button" className="settings-input-toggle" onClick={() => setShowEmailPw(!showEmailPw)}>
                                                    {showEmailPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="settings-btn settings-btn-secondary" disabled={emailSaving}>
                                        {emailSaving ? <Loader2 size={16} className="spinner" /> : <Mail size={16} />}
                                        {emailSaving ? t('loading') : t('changeEmail')}
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
                                    <AlertTriangle size={20} /> {t('dangerZone')}
                                </h2>
                                <p className="settings-card-desc">{t('dangerDesc')}</p>

                                {deactivateMsg && (
                                    <div className={`settings-msg settings-msg-${deactivateMsg.type}`}>
                                        {deactivateMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
                                        {deactivateMsg.text}
                                    </div>
                                )}

                                <div className="settings-form">
                                    <div className="settings-field">
                                        <label>{t('enterPasswordConfirm')}</label>
                                        <div className="settings-input-group">
                                            <input type={showDeactivatePw ? 'text' : 'password'} value={deactivatePassword} onChange={(e) => setDeactivatePassword(e.target.value)} placeholder={t('password')} className="settings-input" />
                                            <button type="button" className="settings-input-toggle" onClick={() => setShowDeactivatePw(!showDeactivatePw)}>
                                                {showDeactivatePw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <label className="settings-checkbox">
                                        <input type="checkbox" checked={deactivateConfirm} onChange={(e) => setDeactivateConfirm(e.target.checked)} />
                                        <span>{t('deactivateCheckbox')}</span>
                                    </label>

                                    <button className="settings-btn settings-btn-danger" disabled={!deactivateConfirm || !deactivatePassword || deactivating} onClick={handleDeactivate}>
                                        {deactivating ? <Loader2 size={16} className="spinner" /> : <AlertTriangle size={16} />}
                                        {deactivating ? t('loading') : t('deactivateAccount')}
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
