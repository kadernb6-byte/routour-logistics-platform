// ============================================
// Internationalization (i18n) — Language System
// ============================================
// Supports: French (fr), Arabic (ar), English (en)
// Usage: const { t } = useLang();  →  t('dashboard')

import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    fr: {
        // ── Général ──
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
        all: 'Tous',
        delete: 'Supprimer',
        edit: 'Modifier',
        confirm: 'Confirmer',
        back: 'Retour',
        next: 'Suivant',
        submit: 'Soumettre',
        yes: 'Oui',
        no: 'Non',

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

        // ── Actions rapides ──
        quickActions: 'Actions rapides',
        publishTrip: 'Publier un trajet',
        publishShipment: 'Publier une expédition',
        findCarriers: 'Trouver des transporteurs',
        findShipments: 'Trouver des expéditions',
        payShipment: 'Payer une expédition',
        verifyCompany: 'Vérifier l\'entreprise',

        // ── Correspondance ──
        matchingShipments: 'Expéditions correspondantes',
        noMatchFound: 'Aucune correspondance trouvée pour ce trajet.',
        contactShipper: 'Contacter l\'expéditeur',
        placeBid: 'Faire une offre',
        manage: 'Gérer',

        // ── États vides ──
        noTripsYet: 'Pas encore de trajets',
        noTripsDesc: 'Publiez votre premier trajet pour commencer à trouver des correspondances.',
        noShipmentsYet: 'Pas encore d\'expéditions',
        noShipmentsDesc: 'Créez votre première expédition pour trouver des transporteurs.',
        noTripsAvailable: 'Aucun trajet disponible',
        noTripsAvailableDesc: 'Les trajets des transporteurs apparaîtront ici.',
        noShipmentsPosted: 'Pas d\'expéditions publiées',
        noShipmentsPostedDesc: 'Les expéditions des expéditeurs apparaîtront ici.',

        // ── Activité récente ──
        recentActivity: 'Activité récente',
        newShipmentCreated: 'Nouvelle expédition créée',
        paymentReceived: 'Paiement reçu',
        tripPublished: 'Trajet publié',

        // ── Statuts ──
        statusPending: 'En attente',
        statusPaid: 'Payé',
        statusCompleted: 'Terminé',
        statusInTransit: 'En transit',
        statusDelivered: 'Livré',
        statusActive: 'Actif',
        statusCancelled: 'Annulé',

        // ── Expéditions ──
        newShipment: 'Nouvelle expédition',
        shipmentTitle: 'Titre de l\'expédition',
        shipmentTitlePlaceholder: 'Pièces électroniques - Fragile',
        description: 'Description',
        descriptionPlaceholder: 'Détails sur le type de marchandise...',
        origin: 'Origine',
        originPlaceholder: 'Alger, Algérie',
        destination: 'Destination',
        destinationPlaceholder: 'Oran, Algérie',
        weightKg: 'Poids (kg)',
        dimensions: 'Dimensions',
        pickupDate: 'Date d\'enlèvement',
        deliveryDate: 'Date de livraison',
        budgetDZD: 'Budget (DZD)',
        searchShipments: 'Rechercher des expéditions...',
        shipperShipmentsDesc: 'Gérez et suivez vos expéditions de fret',
        carrierShipmentsDesc: 'Parcourez les expéditions disponibles et faites des offres',

        // ── Trajets ──
        newTrip: 'Nouveau trajet',
        departureDate: 'Date de départ',
        availableCapacity: 'Capacité disponible (kg)',
        pricePerKg: 'Prix par kg (DZD)',
        vehicleType: 'Type de véhicule',
        notes: 'Notes',
        searchTrips: 'Rechercher des trajets...',
        carrierTripsDesc: 'Gérez vos trajets et trouvez des correspondances',
        shipperTripsDesc: 'Parcourez les trajets disponibles',

        // ── Paiements ──
        amount: 'Montant',
        paymentMethod: 'Méthode de paiement',
        paymentStatus: 'Statut du paiement',
        totalPayments: 'Total des paiements',
        searchPayments: 'Rechercher des paiements...',

        // ── Connexion / Inscription ──
        login: 'Connexion',
        signup: 'Inscription',
        email: 'Adresse e-mail',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        companyName: 'Nom de l\'entreprise',
        iAmA: 'Je suis un',
        shipper: 'Expéditeur',
        carrier: 'Transporteur',
        createAccount: 'Créer un compte',
        alreadyHaveAccount: 'Vous avez déjà un compte ?',
        noAccount: 'Pas encore de compte ?',
        loginSubtitle: 'Connectez-vous à votre espace logistique',
        signupSubtitle: 'Commencez votre aventure logistique',
        signupFailed: 'Échec de l\'inscription',
        loginFailed: 'Échec de la connexion',

        // ── Vérification ──
        verificationTitle: 'Vérification de l\'entreprise',
        verificationDesc: 'Téléchargez vos documents pour vérifier votre entreprise',
        uploadDocument: 'Télécharger un document',
        documentType: 'Type de document',
        registreCommerce: 'Registre de commerce',
        nif: 'NIF',
        license: 'Licence',
        insurance: 'Assurance',
        idCard: 'Carte d\'identité',
        other: 'Autre',

        // ── Paramètres ──
        profileSettings: 'Paramètres du profil',
        firstName: 'Prénom',
        lastName: 'Nom',
        phone: 'Téléphone',
        changePassword: 'Changer le mot de passe',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        changeEmail: 'Changer l\'e-mail',
        newEmail: 'Nouvel e-mail',
        deactivateAccount: 'Désactiver le compte',

        // ── Langue ──
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
        all: 'الكل',
        delete: 'حذف',
        edit: 'تعديل',
        confirm: 'تأكيد',
        back: 'رجوع',
        next: 'التالي',
        submit: 'إرسال',
        yes: 'نعم',
        no: 'لا',

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
        statusCancelled: 'ملغي',

        // ── الشحنات ──
        newShipment: 'شحنة جديدة',
        shipmentTitle: 'عنوان الشحنة',
        shipmentTitlePlaceholder: 'قطع إلكترونية - هشة',
        description: 'الوصف',
        descriptionPlaceholder: 'تفاصيل عن نوع البضاعة...',
        origin: 'المصدر',
        originPlaceholder: 'الجزائر العاصمة',
        destination: 'الوجهة',
        destinationPlaceholder: 'وهران، الجزائر',
        weightKg: 'الوزن (كغ)',
        dimensions: 'الأبعاد',
        pickupDate: 'تاريخ الاستلام',
        deliveryDate: 'تاريخ التسليم',
        budgetDZD: 'الميزانية (د.ج)',
        searchShipments: 'البحث في الشحنات...',
        shipperShipmentsDesc: 'أدر وتابع شحنات البضائع الخاصة بك',
        carrierShipmentsDesc: 'تصفح الشحنات المتاحة وقدم عروضك',

        // ── الرحلات ──
        newTrip: 'رحلة جديدة',
        departureDate: 'تاريخ المغادرة',
        availableCapacity: 'السعة المتاحة (كغ)',
        pricePerKg: 'السعر لكل كغ (د.ج)',
        vehicleType: 'نوع المركبة',
        notes: 'ملاحظات',
        searchTrips: 'البحث في الرحلات...',
        carrierTripsDesc: 'أدر رحلاتك وابحث عن مطابقات',
        shipperTripsDesc: 'تصفح الرحلات المتاحة',

        // ── المدفوعات ──
        amount: 'المبلغ',
        paymentMethod: 'طريقة الدفع',
        paymentStatus: 'حالة الدفع',
        totalPayments: 'إجمالي المدفوعات',
        searchPayments: 'البحث في المدفوعات...',

        // ── تسجيل الدخول / إنشاء حساب ──
        login: 'تسجيل الدخول',
        signup: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        companyName: 'اسم الشركة',
        iAmA: 'أنا',
        shipper: 'شاحن',
        carrier: 'ناقل',
        createAccount: 'إنشاء حساب',
        alreadyHaveAccount: 'لديك حساب بالفعل؟',
        noAccount: 'ليس لديك حساب؟',
        loginSubtitle: 'سجل دخولك إلى منصة اللوجستيك',
        signupSubtitle: 'ابدأ مغامرتك في عالم اللوجستيك',
        signupFailed: 'فشل إنشاء الحساب',
        loginFailed: 'فشل تسجيل الدخول',

        // ── التوثيق ──
        verificationTitle: 'توثيق الشركة',
        verificationDesc: 'ارفع مستنداتك للتحقق من شركتك',
        uploadDocument: 'رفع مستند',
        documentType: 'نوع المستند',
        registreCommerce: 'السجل التجاري',
        nif: 'الرقم الجبائي',
        license: 'الرخصة',
        insurance: 'التأمين',
        idCard: 'بطاقة الهوية',
        other: 'أخرى',

        // ── الإعدادات ──
        profileSettings: 'إعدادات الملف الشخصي',
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        phone: 'الهاتف',
        changePassword: 'تغيير كلمة المرور',
        currentPassword: 'كلمة المرور الحالية',
        newPassword: 'كلمة المرور الجديدة',
        changeEmail: 'تغيير البريد الإلكتروني',
        newEmail: 'البريد الإلكتروني الجديد',
        deactivateAccount: 'تعطيل الحساب',

        // ── اللغة ──
        language: 'اللغة',
    },

    en: {
        // ── General ──
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
        all: 'All',
        delete: 'Delete',
        edit: 'Edit',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        yes: 'Yes',
        no: 'No',

        // ── Sidebar ──
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

        // ── Dashboard ──
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

        // ── Quick Actions ──
        quickActions: 'Quick Actions',
        publishTrip: 'Publish Trip',
        publishShipment: 'Publish Shipment',
        findCarriers: 'Find Carriers',
        findShipments: 'Find Shipments',
        payShipment: 'Pay Shipment',
        verifyCompany: 'Verify Company',

        // ── Matching ──
        matchingShipments: 'Matching Shipments',
        noMatchFound: 'No matching shipments found for this route.',
        contactShipper: 'Contact Shipper',
        placeBid: 'Place Bid',
        manage: 'Manage',

        // ── Empty States ──
        noTripsYet: 'No trips yet',
        noTripsDesc: 'Publish your first trip to start getting matched with shipments.',
        noShipmentsYet: 'No shipments yet',
        noShipmentsDesc: 'Create your first shipment to find carriers.',
        noTripsAvailable: 'No trips available',
        noTripsAvailableDesc: 'Carrier trips will appear here.',
        noShipmentsPosted: 'No shipments posted',
        noShipmentsPostedDesc: 'Shipper shipments will appear here.',

        // ── Recent Activity ──
        recentActivity: 'Recent Activity',
        newShipmentCreated: 'New shipment created',
        paymentReceived: 'Payment received',
        tripPublished: 'Trip published',

        // ── Status ──
        statusPending: 'Pending',
        statusPaid: 'Paid',
        statusCompleted: 'Completed',
        statusInTransit: 'In Transit',
        statusDelivered: 'Delivered',
        statusActive: 'Active',
        statusCancelled: 'Cancelled',

        // ── Shipments ──
        newShipment: 'New Shipment',
        shipmentTitle: 'Shipment Title',
        shipmentTitlePlaceholder: 'Electronic Parts - Fragile',
        description: 'Description',
        descriptionPlaceholder: 'Details about the goods type...',
        origin: 'Origin',
        originPlaceholder: 'Algiers, Algeria',
        destination: 'Destination',
        destinationPlaceholder: 'Oran, Algeria',
        weightKg: 'Weight (kg)',
        dimensions: 'Dimensions',
        pickupDate: 'Pickup Date',
        deliveryDate: 'Delivery Date',
        budgetDZD: 'Budget (DZD)',
        searchShipments: 'Search shipments...',
        shipperShipmentsDesc: 'Manage and track your freight shipments',
        carrierShipmentsDesc: 'Browse available shipments and place bids',

        // ── Trips ──
        newTrip: 'New Trip',
        departureDate: 'Departure Date',
        availableCapacity: 'Available Capacity (kg)',
        pricePerKg: 'Price per kg (DZD)',
        vehicleType: 'Vehicle Type',
        notes: 'Notes',
        searchTrips: 'Search trips...',
        carrierTripsDesc: 'Manage your trips and find matches',
        shipperTripsDesc: 'Browse available trips',

        // ── Payments ──
        amount: 'Amount',
        paymentMethod: 'Payment Method',
        paymentStatus: 'Payment Status',
        totalPayments: 'Total Payments',
        searchPayments: 'Search payments...',

        // ── Login / Signup ──
        login: 'Login',
        signup: 'Sign Up',
        email: 'Email Address',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        companyName: 'Company Name',
        iAmA: 'I am a',
        shipper: 'Shipper',
        carrier: 'Carrier',
        createAccount: 'Create Account',
        alreadyHaveAccount: 'Already have an account?',
        noAccount: "Don't have an account?",
        loginSubtitle: 'Sign in to your logistics platform',
        signupSubtitle: 'Get started with freight logistics',
        signupFailed: 'Signup failed',
        loginFailed: 'Login failed',

        // ── Verification ──
        verificationTitle: 'Company Verification',
        verificationDesc: 'Upload your documents to verify your company',
        uploadDocument: 'Upload Document',
        documentType: 'Document Type',
        registreCommerce: 'Trade Register',
        nif: 'Tax ID (NIF)',
        license: 'License',
        insurance: 'Insurance',
        idCard: 'ID Card',
        other: 'Other',

        // ── Settings ──
        profileSettings: 'Profile Settings',
        firstName: 'First Name',
        lastName: 'Last Name',
        phone: 'Phone',
        changePassword: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        changeEmail: 'Change Email',
        newEmail: 'New Email',
        deactivateAccount: 'Deactivate Account',

        // ── Language ──
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
