import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './errors';

/**
 * Attaches request and response interceptors to an Axios instance.
 */
export function setupInterceptors(axiosInstance: AxiosInstance): AxiosInstance {
  // Request Interceptor: Inject Auth Bearer Tokens
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Future hook: read current session token from local Supabase client
      const token = typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(ApiError.fromError(error));
    }
  );

  // Response Interceptor: Format output and parse global error constructs
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Standardize successful backend responses
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        return response;
      }
      
      // Wrap raw responses in standard API envelope
      response.data = {
        success: true,
        data: responseData,
        error: null,
        meta: {},
      };
      
      return response;
    },
    (error) => {
      // Format Axios network failures into ApiError objects
      return Promise.reject(ApiError.fromError(error));
    }
  );

  return axiosInstance;
}
