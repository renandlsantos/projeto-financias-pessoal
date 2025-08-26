import axios, { AxiosResponse } from 'axios';
import {
  CategoryCreate,
  CategoryUpdate,
  CategoryRead,
  CategoryWithSubcategories,
  CategoryFilters,
  TransactionType
} from '../types/budgets';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE_URL}/api/v1`;

// API Client configuration
const apiClient = axios.create({
  baseURL: API_V1,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class CategoryService {
  /**
   * Cria uma nova categoria
   */
  static async createCategory(categoryData: CategoryCreate): Promise<CategoryRead> {
    const response: AxiosResponse<CategoryRead> = await apiClient.post('/categories', categoryData);
    return response.data;
  }

  /**
   * Lista categorias do usuário com filtros
   */
  static async getCategories(filters?: CategoryFilters): Promise<CategoryRead[]> {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type_filter', filters.type);
    if (filters?.parent_id) params.append('parent_id', filters.parent_id);
    if (filters?.include_system !== undefined) params.append('include_system', String(filters.include_system));
    if (filters?.include_subcategories !== undefined) params.append('include_subcategories', String(filters.include_subcategories));

    const response: AxiosResponse<CategoryRead[]> = await apiClient.get(`/categories?${params.toString()}`);
    return response.data;
  }

  /**
   * Lista categorias com subcategorias aninhadas
   */
  static async getCategoriesWithSubcategories(
    typeFilter?: TransactionType,
    includeSystem: boolean = true
  ): Promise<CategoryWithSubcategories[]> {
    const params = new URLSearchParams();
    
    if (typeFilter) params.append('type_filter', typeFilter);
    params.append('include_system', String(includeSystem));

    const response: AxiosResponse<CategoryWithSubcategories[]> = await apiClient.get(
      `/categories/with-subcategories?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Busca categoria por ID
   */
  static async getCategoryById(categoryId: string): Promise<CategoryRead> {
    const response: AxiosResponse<CategoryRead> = await apiClient.get(`/categories/${categoryId}`);
    return response.data;
  }

  /**
   * Atualiza categoria existente
   */
  static async updateCategory(categoryId: string, updateData: CategoryUpdate): Promise<CategoryRead> {
    const response: AxiosResponse<CategoryRead> = await apiClient.put(`/categories/${categoryId}`, updateData);
    return response.data;
  }

  /**
   * Remove categoria (soft delete)
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    await apiClient.delete(`/categories/${categoryId}`);
  }

  /**
   * Lista categorias do sistema
   */
  static async getSystemCategories(typeFilter?: TransactionType): Promise<CategoryRead[]> {
    const params = new URLSearchParams();
    if (typeFilter) params.append('type_filter', typeFilter);

    const response: AxiosResponse<CategoryRead[]> = await apiClient.get(`/categories/system?${params.toString()}`);
    return response.data;
  }

  /**
   * Busca categorias por tipo
   */
  static async getCategoriesByType(type: TransactionType, includeSystem: boolean = true): Promise<CategoryRead[]> {
    return this.getCategories({
      type,
      include_system: includeSystem,
      include_subcategories: true
    });
  }

  /**
   * Busca apenas categorias principais (sem subcategorias)
   */
  static async getMainCategories(type?: TransactionType): Promise<CategoryRead[]> {
    return this.getCategories({
      type,
      parent_id: undefined,
      include_system: true,
      include_subcategories: false
    });
  }

  /**
   * Busca subcategorias de uma categoria
   */
  static async getSubcategories(parentId: string, type?: TransactionType): Promise<CategoryRead[]> {
    return this.getCategories({
      type,
      parent_id: parentId,
      include_system: true,
      include_subcategories: false
    });
  }
}
