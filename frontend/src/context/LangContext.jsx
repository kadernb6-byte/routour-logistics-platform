// ============================================
// Internationalization (i18n) — Language System
// ============================================
// Supports: French (fr), Arabic (ar), English (en)
// Usage: const { t } = useLang();  →  t('dashboard')

import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    fr: {
        // ── General ──
        dashboard: 'Tableau de bord',
        welcome: 'Bienvenue',
        welcomeBack: 'Bon retour',
        refresh: 'Actualiser',
        search: 'Rechercher expéditions, transporteurs, itinéraires...',
        loading: 'Chargement...',
        noData: 'Aucune donnée',
        close: 'Fermer',
        create: 'Créer',
        cancel: 'Annuler',
        save: 'Enregistrer',
        viewAll: 'Voir tout',

        // ── Sidebar ──
        overview: 'Aperçu',
        analytics: 'Analytique',
        operations: 'Opérations',
        shipments: 'Expéditions',
        trips: 'Trajets',
        payments: 'Paiements',
        bids: 'Offres & Devis',
        management: 'Gestion',
        verification: 'Vérification',
        companyProfile: 'Profil de l\'entreprise',
        teamMembers: 'Membres de l\'équipe',
        settings: 'Paramètres',
        logout: 'Déconnexion',

        // ── Dashboard ──
        carrierWelcome: 'Gérez vos trajets et trouvez des expéditions correspondantes',
        shipperWelcome: 'Suivez vos expéditions et trouvez des transporteurs',
        myTrips: 'Mes trajets',
        myShipments: 'Mes expéditions',
        availableShipments: 'Expéditions disponibles',
        availableTrips: 'Trajets disponibles',
        activeRoutes: 'Routes actives',
        pendingMatches: 'Correspondances en attente',
        pending: 'En attente',
        inTransit: 'En transit',
        totalEarned: 'Total gagné',
        totalSpent: 'Total dépensé',
        commission: 'Commission',

        // ── Quick Actions ──
        quickActions: 'Actions rapides',
        publishTrip: 'Publier un trajet',
        publishShipment: 'Publier une expédition',
        findCarriers: 'Trouver des transporteurs',
        findShipments: 'Trouver des expéditions',
        payShipment: 'Payer une expédition',
        verifyCompany: 'Vérifier l\'entreprise',

        // ── Matching ──
        matchingShipments: 'Expéditions correspondantes',
        noMatchFound: 'Aucune correspondance trouvée pour ce trajet.',
        contactShipper: 'Contacter l\'expéditeur',
        placeBid: 'Faire une offre',
        manage: 'Gérer',

        // ── Empty States ──
        noTripsYet: 'Pas encore de trajets',
        noTripsDesc: 'Publiez votre premier trajet pour commencer à trouver des correspondances.',
        noShipmentsYet: 'Pas encore d\'expéditions',
        noShipmentsDesc: 'Créez votre première expédition pour trouver des transporteurs.',
        noTripsAvailable: 'Aucun trajet disponible',
        noTripsAvailableDesc: 'Les trajets des transporteurs apparaîtront ici.',
        noShipmentsPosted: 'Pas d\'expéditions publiées',
        noShipmentsPostedDesc: 'Les expéditions des expéditeurs apparaîtront ici.',

        // ── Recent Activity ──
        recentActivity: 'Activité récente',
        newShipmentCreated: 'Nouvelle expédition créée',
        paymentReceived: 'Paiement reçu',
        tripPublished: 'Trajet publié',

        // ── Status ──
        statusPending: 'En attente',
        statusPaid: 'Payé',
        statusCompleted: 'Terminé',
        statusInTransit: 'En transit',
        statusDelivered: 'Livré',
        statusActive: 'Actif',

        // ── Language ──
        language: 'Langue',
    },

    ar: {
        // ── عام ──
        dashboard: 'لوحة التحكم',
        welcome: 'مرحباً',
        welcomeBack: 'مرحباً بعودتك',
        refresh: 'تحديث',
        search: 'البحث عن شحنات، ناقلين، مسارات...',
        loading: 'جاري التحميل...',
        noData: 'لا توجد بيانات',
        close: 'إغلاق',
        create: 'إنشاء',
        cancel: 'إلغاء',
        save: 'حفظ',
        viewAll: 'عرض الكل',

        // ── الشريط الجانبي ──
        overview: 'نظرة عامة',
        analytics: 'التحليلات',
        operations: 'العمليات',
        shipments: 'الشحنات',
        trips: 'الرحلات',
        payments: 'المدفوعات',
        bids: 'العروض والأسعار',
        management: 'الإدارة',
        verification: 'التوثيق',
        companyProfile: 'ملف الشركة',
        teamMembers: 'أعضاء الفريق',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج',

        // ── لوحة التحكم ──
        carrierWelcome: 'أدر رحلاتك وابحث عن شحنات مطابقة',
        shipperWelcome: 'تابع شحناتك وابحث عن ناقلين',
        myTrips: 'رحلاتي',
        myShipments: 'شحناتي',
        availableShipments: 'الشحنات المتاحة',
        availableTrips: 'الرحلات المتاحة',
        activeRoutes: 'المسارات النشطة',
        pendingMatches: 'المطابقات المعلقة',
        pending: 'معلق',
        inTransit: 'قيد النقل',
        totalEarned: 'إجمالي الأرباح',
        totalSpent: 'إجمالي الإنفاق',
        commission: 'العمولة',

        // ── الإجراءات السريعة ──
        quickActions: 'إجراءات سريعة',
        publishTrip: 'نشر رحلة',
        publishShipment: 'نشر شحنة',
        findCarriers: 'البحث عن ناقلين',
        findShipments: 'البحث عن شحنات',
        payShipment: 'دفع شحنة',
        verifyCompany: 'توثيق الشركة',

        // ── المطابقة ──
        matchingShipments: 'الشحنات المطابقة',
        noMatchFound: 'لم يتم العثور على مطابقة لهذا المسار.',
        contactShipper: 'الاتصال بالشاحن',
        placeBid: 'تقديم عرض',
        manage: 'إدارة',

        // ── حالات فارغة ──
        noTripsYet: 'لا توجد رحلات بعد',
        noTripsDesc: 'انشر أول رحلة لبدء المطابقة مع الشحنات.',
        noShipmentsYet: 'لا توجد شحنات بعد',
        noShipmentsDesc: 'أنشئ أول شحنة للعثور على ناقلين.',
        noTripsAvailable: 'لا توجد رحلات متاحة',
        noTripsAvailableDesc: 'ستظهر رحلات الناقلين هنا.',
        noShipmentsPosted: 'لا توجد شحنات منشورة',
        noShipmentsPostedDesc: 'ستظهر شحنات الشاحنين هنا.',

        // ── النشاط الأخير ──
        recentActivity: 'النشاط الأخير',
        newShipmentCreated: 'شحنة جديدة تم إنشاؤها',
        paymentReceived: 'تم استلام الدفع',
        tripPublished: 'تم نشر رحلة',

        // ── الحالة ──
        statusPending: 'معلق',
        statusPaid: 'مدفوع',
        statusCompleted: 'مكتمل',
        statusInTransit: 'قيد النقل',
        statusDelivered: 'تم التوصيل',
        statusActive: 'نشط',

        // ── اللغة ──
        language: 'اللغة',
    },

    en: {
        dashboard: 'Dashboard',
        welcome: 'Welcome',
        welcomeBack: 'Welcome back',
        refresh: 'Refresh',
        search: 'Search shipments, carriers, routes...',
        loading: 'Loading...',
        noData: 'No data',
        close: 'Close',
        create: 'Create',
        cancel: 'Cancel',
        save: 'Save',
        viewAll: 'View All',

        overview: 'Overview',
        analytics: 'Analytics',
        operations: 'Operations',
        shipments: 'Shipments',
        trips: 'Trips',
        payments: 'Payments',
        bids: 'Bids & Quotes',
        management: 'Management',
        verification: 'Verification',
        companyProfile: 'Company Profile',
        teamMembers: 'Team Members',
        settings: 'Settings',
        logout: 'Logout',

        carrierWelcome: 'Manage your trips and find matching shipments',
        shipperWelcome: 'Track your shipments and find carriers',
        myTrips: 'My Trips',
        myShipments: 'My Shipments',
        availableShipments: 'Available Shipments',
        availableTrips: 'Available Trips',
        activeRoutes: 'Active Routes',
        pendingMatches: 'Pending Matches',
        pending: 'Pending',
        inTransit: 'In Transit',
        totalEarned: 'Total Earned',
        totalSpent: 'Total Spent',
        commission: 'Commission',

        quickActions: 'Quick Actions',
        publishTrip: 'Publish Trip',
        publishShipment: 'Publish Shipment',
        findCarriers: 'Find Carriers',
        findShipments: 'Find Shipments',
        payShipment: 'Pay Shipment',
        verifyCompany: 'Verify Company',

        matchingShipments: 'Matching Shipments',
        noMatchFound: 'No matching shipments found for this route.',
        contactShipper: 'Contact Shipper',
        placeBid: 'Place Bid',
        manage: 'Manage',

        noTripsYet: 'No trips yet',
        noTripsDesc: 'Publish your first trip to start getting matched with shipments.',
        noShipmentsYet: 'No shipments yet',
        noShipmentsDesc: 'Create your first shipment to find carriers.',
        noTripsAvailable: 'No trips available',
        noTripsAvailableDesc: 'Carrier trips will appear here.',
        noShipmentsPosted: 'No shipments posted',
        noShipmentsPostedDesc: 'Shipper shipments will appear here.',

        recentActivity: 'Recent Activity',
        newShipmentCreated: 'New shipment created',
        paymentReceived: 'Payment received',
        tripPublished: 'Trip published',

        statusPending: 'Pending',
        statusPaid: 'Paid',
        statusCompleted: 'Completed',
        statusInTransit: 'In Transit',
        statusDelivered: 'Delivered',
        statusActive: 'Active',

        language: 'Language',
    },
};

const LangContext = createContext();

export function LangProvider({ children }) {
    const [lang, setLang] = useState(() => localStorage.getItem('routeur_lang') || 'fr');

    useEffect(() => {
        localStorage.setItem('routeur_lang', lang);
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }, [lang]);

    const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

    return (
        <LangContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LangContext.Provider>
    );
}

export function useLang() {
    const context = useContext(LangContext);
    if (!context) throw new Error('useLang must be used within LangProvider');
    return context;
}

export const LANGUAGES = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇩🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default translations;
