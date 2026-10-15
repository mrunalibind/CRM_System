
const API_BASE_URL = '/api';

async function request(endpoint, options = {}, authenticated = true) {
    const token = localStorage.getItem('crm_token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(authenticated && token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

export const api = {
    register: (payload) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    login: (payload) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    getMe: () => request('/auth/me'),

    createEnquiry: (payload) =>
        request(
            '/enquiries',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            },
            false
        ),

    getPublicEnquiries: () => request('/enquiries/public'),

    getMyEnquiries: () => request('/enquiries/mine'),

    claimEnquiry: (id) =>
        request(`/enquiries/${id}/claim`, {
            method: 'PATCH',
        }),
};

export default api;
