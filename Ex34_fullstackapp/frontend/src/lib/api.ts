import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/auth/login' &&
            !originalRequest.url.includes('/login')
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    performLogout();
                    return Promise.reject(error);
                }

                const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken,
                });

                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                performLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

function performLogout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
}

export const AuthAPI = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    register: (data: any) => api.post('/auth/register', data),
    refreshToken: (token: string) => api.post('/auth/refresh-token', { refreshToken: token }),
};

export const ProductAPI = {
    getAll: () => api.get('/products'),
    getOne: (id: number | string) => api.get(`/products/${id}`),
    create: (data: any) => api.post('/products', data),
    update: (id: number | string, data: any) => api.put(`/products/${id}`, data),
    getSeoDescription: (id: number | string) => api.get(`/products/${id}/seo-description`),
};

export const CategoryAPI = {
    getAll: () => api.get('/categories'),
};

export const StatusAPI = {
    getAll: () => api.get('/status'),
};

export const OrderAPI = {
    getAll: () => api.get('/orders'),
    create: (data: any) => api.post('/orders', data),
    updateStatus: (id: number | string, statusId: number) => api.patch(`/orders/${id}`, { statusId }),
    getByStatus: (statusId: number | string) => api.get(`/orders/status/${statusId}`),
    addOpinion: (id: number | string, data: { rating: number; content: string }) => api.post(`/orders/${id}/opinions`, data),
};

export const InitAPI = {
    initializeDatabase: (products: any[]) => api.post('/init', products),
};

export default api;