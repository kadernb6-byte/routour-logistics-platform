// ============================================
// API Service — Named exports for each endpoint
// ============================================
// Centralized HTTP client for all API calls.
// Automatically attaches JWT token and handles errors.

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Custom fetch wrapper with auth token and JSON handling.
 */
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('routeur_token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'API request failed');
        error.response = { data, status: response.status };

        // Auto-logout on 401
        if (response.status === 401) {
            localStorage.removeItem('routeur_token');
            localStorage.removeItem('routeur_user');
            window.location.href = '/login';
        }

        throw error;
    }

    return data;
};

// ---- Generic methods ----
const api = {
    get: (endpoint) => apiCall(endpoint, { method: 'GET' }),

    post: (endpoint, body) =>
        apiCall(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    put: (endpoint, body) =>
        apiCall(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        }),

    delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' }),
};

// ---- Auth ----
export const loginUser = (email, password) =>
    api.post('/auth/login', { email, password });

export const signupUser = (data) =>
    api.post('/auth/signup', data);

export const getProfile = () =>
    api.get('/auth/me');

// ---- Trips ----
export const getTrips = (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/trips${params ? `?${params}` : ''}`);
};

export const getMyTrips = () =>
    api.get('/trips/mine');

export const createTrip = (tripData) =>
    api.post('/trips', tripData);

export const matchShipments = (tripId) =>
    api.get(`/trips/match/${tripId}`);

export const updateTrip = (id, data) =>
    api.put(`/trips/${id}`, data);

// ---- Shipments ----
export const getShipments = (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/shipments${params ? `?${params}` : ''}`);
};

export const createShipment = (data) =>
    api.post('/shipments', data);

export const updateShipment = (id, data) =>
    api.put(`/shipments/${id}`, data);

// ---- Payments ----
export const createPayment = (data) =>
    api.post('/payments', data);

export const getPayments = (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/payments${params ? `?${params}` : ''}`);
};

export const getPaymentStats = () =>
    api.get('/payments/stats');

export const completePayment = (id) =>
    api.put(`/payments/${id}/complete`);

export const getPlatformRevenue = () =>
    api.get('/payments/revenue');

// ---- Bookings ----
export const createBooking = (data) =>
    api.post('/bookings', data);

export const getBookings = () =>
    api.get('/bookings');

export const getBookingById = (id) =>
    api.get(`/bookings/${id}`);

export const updateBookingStatus = (id, status) =>
    api.put(`/bookings/${id}/status`, { status });

export const updateBookingPayment = (id, paymentStatus) =>
    api.put(`/bookings/${id}/payment`, { paymentStatus });

export default api;

