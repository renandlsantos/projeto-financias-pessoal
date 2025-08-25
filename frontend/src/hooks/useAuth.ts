import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../store/slices/authSlice';
import { apiClient } from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      dispatch(loginStart());
      const response = await apiClient.post<TokenResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Buscar dados do usuário
      const userResponse = await apiClient.get<User>(API_ENDPOINTS.USERS.ME, {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      });
      
      dispatch(loginSuccess({
        user: userResponse.data,
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
      }));
      
      return { success: true };
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao fazer login';
      dispatch(loginFailure(message));
      return { success: false, error: message };
    }
  }, [dispatch]);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      dispatch(loginStart());
      await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      // Após registro, fazer login automático
      return await login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao criar conta';
      dispatch(loginFailure(message));
      return { success: false, error: message };
    }
  }, [dispatch, login]);

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  };
};
