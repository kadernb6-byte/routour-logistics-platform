import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Truck,
    FileText,
    Settings,
    Users,
    BarChart3,
    LogOut,
    Building2,
    Shield,
    CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import logoIcon from '../../assets/logo-icon.svg';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { t } = useLang();
    const location = useLocation();

    // Navigation items — translated
    const navSections = [
        {
            title: t('overview'),
            items: [
                { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
                { to: '/analytics', icon: BarChart3, label: t('analytics') },
            ],
        },
        {
            title: t('operations'),
            items: [
                { to: '/shipments', icon: Package, label: t('shipments') },
                { to: '/trips', icon: Truck, label: t('trips') },
                ...(user?.role === 'shipper'
                    ? [{ to: '/bids', icon: FileText, label: t('bids') }]
                    : []),
                { to: '/payments', icon: CreditCard, label: t('payments') },
            ],
        },
        {
            title: t('management'),
            items: [
                { to: '/verification', icon: Shield, label: t('verification') },
                { to: '/company', icon: Building2, label: t('companyProfile') },
                { to: '/team', icon: Users, label: t('teamMembers') },
                { to: '/settings', icon: Settings, label: t('settings') },
            ],
        },
    ];

    const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.companyName || user?.email || 'User';

    const getInitials = () => {
        if (!user) return 'U';
        if (user.firstName) return user.firstName[0].toUpperCase();
        return user.companyName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Brand */}
                <div className="sidebar-header">
                    <img src={logoIcon} alt="Routeur" className="sidebar-logo-img" />
                    <span className="sidebar-brand">Routeur</span>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navSections.map((section) => (
                        <div key={section.title}>
                            <div className="sidebar-section-title">{section.title}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `sidebar-link ${isActive ? 'active' : ''}`
                                    }
                                    onClick={onClose}
                                >
                                    <item.icon className="sidebar-link-icon" size={20} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User section */}
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{getInitials()}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">
                                {displayName}
                            </div>
                            <div className="sidebar-user-role">
                                {user?.role || 'carrier'}
                            </div>
                        </div>
                    </div>
                    <button
                        className="sidebar-link"
                        onClick={logout}
                        style={{ marginTop: '8px', width: '100%' }}
                    >
                        <LogOut className="sidebar-link-icon" size={20} />
                        {t('logout')}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
