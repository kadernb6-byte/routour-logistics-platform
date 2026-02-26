import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, Globe, Package, Truck, CreditCard, CheckCircle, X } from 'lucide-react';
import { useLang, LANGUAGES } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

// Generate notifications from real data context
const generateNotifications = (t) => [
    {
        id: 1,
        icon: Package,
        color: '#f59e0b',
        title: t('newShipmentCreated'),
        desc: 'Alger → Oran',
        time: '2m',
        unread: true,
    },
    {
        id: 2,
        icon: Truck,
        color: '#6366f1',
        title: t('tripPublished'),
        desc: 'Oran → Constantine',
        time: '15m',
        unread: true,
    },
    {
        id: 3,
        icon: CreditCard,
        color: '#10b981',
        title: t('paymentReceived'),
        desc: '45,000 DZD',
        time: '1h',
        unread: false,
    },
    {
        id: 4,
        icon: CheckCircle,
        color: '#06b6d4',
        title: t('statusDelivered'),
        desc: 'Alger → Batna',
        time: '3h',
        unread: false,
    },
];

const Header = ({ onMenuToggle }) => {
    const { lang, setLang, t } = useLang();
    const { user } = useAuth();
    const [langOpen, setLangOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const langRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        setNotifications(generateNotifications(t));
    }, [t]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const currentLang = LANGUAGES.find(l => l.code === lang);
    const unreadCount = notifications.filter(n => n.unread).length;

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const dismissNotif = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <button
                    className="header-menu-btn"
                    onClick={onMenuToggle}
                    id="menu-toggle"
                    aria-label="Toggle sidebar menu"
                >
                    <Menu size={22} />
                </button>

                <div className="header-search">
                    <Search className="header-search-icon" size={18} />
                    <input
                        type="text"
                        placeholder={t('search')}
                        id="global-search"
                    />
                </div>
            </div>

            <div className="header-right">
                {/* Language Switcher */}
                <div className="lang-switch" ref={langRef}>
                    <button
                        className="header-icon-btn lang-btn"
                        id="lang-switcher"
                        onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); }}
                        aria-label="Switch language"
                    >
                        <Globe size={18} />
                        <span className="lang-current">{currentLang?.flag}</span>
                    </button>

                    {langOpen && (
                        <div className="lang-dropdown">
                            {LANGUAGES.map(l => (
                                <button
                                    key={l.code}
                                    className={`lang-option ${lang === l.code ? 'active' : ''}`}
                                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                                >
                                    <span className="lang-flag">{l.flag}</span>
                                    <span className="lang-label">{l.label}</span>
                                    {lang === l.code && <span className="lang-check">✓</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="notif-switch" ref={notifRef}>
                    <button
                        className="header-icon-btn"
                        id="notifications-btn"
                        aria-label="Notifications"
                        onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); }}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="notif-dropdown">
                            <div className="notif-header">
                                <h4>Notifications</h4>
                                {unreadCount > 0 && (
                                    <button className="notif-mark-read" onClick={markAllRead}>
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <div className="notif-empty">
                                    <Bell size={24} />
                                    <span>No notifications</span>
                                </div>
                            ) : (
                                <div className="notif-list">
                                    {notifications.map(notif => {
                                        const Icon = notif.icon;
                                        return (
                                            <div key={notif.id} className={`notif-item ${notif.unread ? 'unread' : ''}`}>
                                                <div className="notif-icon" style={{ background: `${notif.color}15`, color: notif.color }}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="notif-content">
                                                    <div className="notif-title">{notif.title}</div>
                                                    <div className="notif-desc">{notif.desc}</div>
                                                </div>
                                                <div className="notif-meta">
                                                    <span className="notif-time">{notif.time}</span>
                                                    <button className="notif-dismiss" onClick={() => dismissNotif(notif.id)}>
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
