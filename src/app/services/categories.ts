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
  private baseUrl = "https://w370351.ferozo.com/api"; // base de la API
  
  // verifica que exista un token
  private getHeaders(): HttpHeaders {
    const token = this.authService.token || localStorage.getItem('token'); 
    if (!token) { //comprueba si el token no existe y lanza un error
      throw new Error('No hay sesión activa');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // le dice a la API que el usuario esta autenticado
    });
}

async getCategoryById(id: number): Promise<CategoryId> {
    const url = `${this.baseUrl}/categories/${id}`;
    const headers = this.getHeaders();
    return firstValueFrom(this.http.get<CategoryId>(url, { headers }));
  }

// obtiene todas las categorías asociadas al usuario logueado
async getCategories(): Promise<CategoryId[]> { // promete devolver un array de categorías con ID
  const userId = this.authService.currentUserId; //recupera el ID del usuario actual
  if (!userId) {
      throw new Error('El ID de usuario no está disponible.');
    }
    const url = `${this.baseUrl}/users/${userId!}/categories`; 
  const headers = this.getHeaders(); 
    
    return firstValueFrom(this.http.get<CategoryId[]>(url, { headers }));//devuelve un array de categorias
}

// agregar una nueva categoria
async createCategory(categoryData: Category): Promise<CategoryId> { //recibe dtps de la nueva categoria y promete devolver a categoría ya creada con su ID
    const url = `${this.baseUrl}/categories`;
    const headers = this.getHeaders();
    return firstValueFrom(this.http.post<CategoryId>(url, categoryData, { headers })); // realiza la peticion post y devuelve el objeto CategoryId completo (la categoría con su ID ya asignado)
  }

// editar una categoria
async updateCategory(id: number, categoryData: Category): Promise<any> { //rcibe el id de la categoría a modificar y los nuevos categoryData
    const url = `${this.baseUrl}/categories/${id}`;
    const headers = this.getHeaders();
    return firstValueFrom(this.http.put<any>(url, categoryData, { headers }));
}


// eliminar una categoria
async deleteCategory(id: number): Promise<void> {// recibe el ID de la categoria que se va a eliminar
    const url = `${this.baseUrl}/categories/${id}`; //construye la URL para apuntar al recurso específico mediante su ID
  const headers = this.getHeaders();
    await firstValueFrom(this.http.delete<void>(url, { headers }));// ejecuta la petidicon delete y no deuelve nada por el <void>
    }
}
