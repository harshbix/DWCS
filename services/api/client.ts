import axios from 'axios';
import { setupInterceptors } from './interceptors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Global Axios Client for client-side queries requiring interceptor actions.
 */
export const apiClient = setupInterceptors(
  axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
);
