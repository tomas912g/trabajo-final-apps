import { inject, Injectable } from '@angular/core';
import { Category, CategoryId } from '../interfaces/category';
import { AuthService } from './auth-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private http = inject(HttpClient);
  private authService = inject(AuthService); 
  private baseUrl = 'https://agenda-api.somee.com/api'; // base de la API

  private getHeaders(): HttpHeaders {
    const token = this.authService.token; 
    if (!token) {
      throw new Error('No hay sesión activa. Token no disponible.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
}

// obtiene todas las categorías asociadas al usuario logueado
async getCategories(): Promise<CategoryId[]> {
  const userId = this.authService.currentUserId;
  if (!userId) {
      throw new Error('El ID de usuario no está disponible.');
    }
    const url = `${this.baseUrl}/users/${userId!}/categories`; 
  const headers = this.getHeaders(); 
    
    return firstValueFrom(this.http.get<CategoryId[]>(url, { headers }));
}

// agregar una nueva categoria
async createCategory(categoryData: Category): Promise<CategoryId> {
    const url = `${this.baseUrl}/categories`;
    const headers = this.getHeaders();
    return firstValueFrom(this.http.post<CategoryId>(url, categoryData, { headers })); 
  }

// editar una categoria
async updateCategory(id: number, categoryData: Category): Promise<any> {
    const url = `${this.baseUrl}/categories/${id}`; 
  const headers = this.getHeaders();
    return firstValueFrom(this.http.put(url, categoryData, { headers }));
  }

// eliminar una categoria
async deleteCategory(id: number): Promise<void> {
    const url = `${this.baseUrl}/categories/${id}`; 
  const headers = this.getHeaders();
    await firstValueFrom(this.http.delete<void>(url, { headers }));
    }
}
