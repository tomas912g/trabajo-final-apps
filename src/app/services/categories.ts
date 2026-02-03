import { inject, Injectable } from '@angular/core';
import { Category, CategoryId } from '../interfaces/category';
import { AuthService } from './auth-service';



@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private authService = inject(AuthService); 
  private baseUrl = "https://w370351.ferozo.com/api";

  async getCategories(): Promise <CategoryId[]> {
    const userId = this.authService.currentUserId;
    if (!userId) throw new Error('El ID de usuario no está disponible.'); //aseguramos que si hay un error sea manejado, throw new error detiene el programa
    const res = await fetch(`${this.baseUrl}/users/${userId}/categories`, {
      method: 'GET',
      headers: this.authService.getAuthHeaders()
    });
      if(!res.ok) throw new Error("Error al obtener categorias");
      return await res.json();
    }
  

  async getCategoryById(id: number): Promise<CategoryId> {
    const res = await fetch(`${this.baseUrl}/categories/${id}`, {
      method: 'GET',
      headers: this.authService.getAuthHeaders()
    });
      if(!res.ok) throw new Error("Error al obtener la categoria");
      return await res.json();
    }

  

async createCategory(categoryData: Category): Promise<CategoryId> { 
   const res = await fetch (`${this.baseUrl}/categories`, {
    method: 'POST',
    headers: this.authService.getAuthHeaders(),
    body: JSON.stringify(categoryData)
  });
  if (!res.ok) throw new Error("Error al crear categoría");
    return await res.json();
  }

async updateCategory(id: number, categoryData: Category): Promise<any> { 
    const res = await fetch (`${this.baseUrl}/categories/${id}`, { 
      method: 'PUT',
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });
if (!res.ok) throw new Error("Error al actualizar categoría");
    return await res.json(); // O void si no devuelve nada
  }


async deleteCategory(id: number): Promise<void> {
    const res = await fetch (`${this.baseUrl}/categories/${id}`, { 
      method: 'DELETE',
      headers: this.authService.getAuthHeaders(),
      }); 
      if(!res.ok) throw new Error("Error al eliminar categoría");
    }
  }
