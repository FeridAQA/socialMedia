// services/api.ts
import config from '@/config';
import axios from 'axios';
// Redux store-u birbaşa import edə bilmərik, çünki bu fayl React komponenti deyil.
// Tokeni localStorage-dan alacağıq, bu client-side bir əməliyyatdır.

const API_BASE_URL = config.apiBaseUrl ; // Backend-inizin baza URL-i

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: hər sorğuya token əlavə etmək
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') { // Yalnız client tərəfdə işləsin
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: 401 Unauthorized xətası zamanı tokeni təmizləmək və yönləndirmək
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // 401 xətası aldıqda tokeni təmizləyin və login səhifəsinə yönləndirin
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Redux store-u da təmizləmək üçün burada dispatch çağıra bilmərik.
        // Bunu component səviyyəsində, catch blokunda idarə etmək daha yaxşıdır.
        // Məsələn, useRouter().push('/login')
        window.location.href = '/login'; // Refresh ilə login səhifəsinə yönləndirir
      }
    }
    return Promise.reject(error);
  }
);

export default api;