import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Finance API
export const financeApi = {
  // Accounts
  getAccounts: (includeInactive = false) =>
    api.get(`/accounts?includeInactive=${includeInactive}`),
  
  getAccount: (code: string) =>
    api.get(`/accounts/${code}`),

  // Journals
  postJournal: (data: any) =>
    api.post('/journals/post', data),
  
  getJournal: (id: string) =>
    api.get(`/journals/${id}`),
  
  getJournals: (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    return api.get(`/journals?${params.toString()}`);
  },

  // Periods
  getCurrentPeriod: () =>
    api.get('/periods/current'),

  // Reports
  getTrialBalance: (asOfDate?: string) =>
    api.get(`/reports/trial-balance?asOfDate=${asOfDate || ''}`),
};

// HR API
export const hrApi = {
  // Employees
  getEmployees: (includeInactive = false) =>
    api.get(`/employees?includeInactive=${includeInactive}`),
  
  getEmployee: (id: string) =>
    api.get(`/employees/${id}`),
  
  createEmployee: (data: any) =>
    api.post('/employees', data),

  // Payroll
  runPayroll: (data: any) =>
    api.post('/payroll/run', data),
  
  getPayrollRuns: (period?: string) =>
    api.get(`/payroll/runs?period=${period || ''}`),
  
  getPayrollPeriods: () =>
    api.get('/payroll/periods'),
  
  getPayrollSummary: (period: string) =>
    api.get(`/reports/payroll-summary?period=${period}`),
};

// Health check
export const healthApi = {
  checkFinance: () => api.get('/health'),
  checkHR: () => api.get('/health'),
};

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utility functions
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Une erreur est survenue';
  }
  return error.message || 'Une erreur inattendue est survenue';
};

export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};