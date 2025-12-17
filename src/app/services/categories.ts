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
  private baseUrl = "https://w370351.ferozo.com/api";
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.token || localStorage.getItem('token'); 
    if (!token) {
      throw new Error('No hay sesión activa');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` 
    });
}

async getCategoryById(id: number): Promise<CategoryId> {
    const url = `${this.baseUrl}/categories/${id}`;
    const headers = this.getHeaders();
    return firstValueFrom(this.http.get<CategoryId>(url, { headers }));
  }

async getCategories(): Promise<CategoryId[]> {
  const userId = this.authService.currentUserId; 
  if (!userId) {
      throw new Error('El ID de usuario no está disponible.');
    }
    const url = `${this.baseUrl}/users/${userId!}/categories`; 
  const headers = this.getHeaders(); 
    
    return firstValueFrom(this.http.get<CategoryId[]>(url, { headers }));
}

async createCategory(categoryData: Category): Promise<CategoryId> { 
    const url = `${this.baseUrl}/categories`;
    const headers = this.getHeaders();
    return firstValueFrom(this.http.post<CategoryId>(url, categoryData, { headers })); 
  }

async updateCategory(id: number, categoryData: Category): Promise<any> { 
    const url = `${this.baseUrl}/categories/${id}`;
    const headers = this.getHeaders();
    return firstValueFrom(this.http.put<any>(url, categoryData, { headers }));
}

async deleteCategory(id: number): Promise<void> {
    const url = `${this.baseUrl}/categories/${id}`; 
  const headers = this.getHeaders();
    await firstValueFrom(this.http.delete<void>(url, { headers }));
    }
}
