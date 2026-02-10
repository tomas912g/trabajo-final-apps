import { inject, Injectable } from '@angular/core';
import { Category, CategoryId } from '../interfaces/category';
import { AuthService } from './auth-service';



@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private authService = inject(AuthService); // injectamos el authService en "private" para que solo se pueda usar en esta clase y no fuera
  private baseUrl = "https://w370351.ferozo.com/api"; // guardamos la api como variable

  async getCategories(): Promise <CategoryId[]> { // Promete que si todo sale bien devolvera un array[] de tipo categoryId
    const userId = this.authService.currentUserId; // usamos el getter del auth para obtener el id
    if (!userId) throw new Error('El ID de usuario no está disponible.'); //aseguramos que si hay un error sea manejado, throw new error detiene el programa evitando que llamemos a la api
    const res = await fetch(`${this.baseUrl}/users/${userId}/categories`, { // construimos la url dinamica para insertar el ${userId}
      method: 'GET', // enviamos metodo para leer datos
      headers: this.authService.getAuthHeaders() // Llamamos al auth para obtener el token
    });
      if(!res.ok) throw new Error("Error al obtener categorias"); // si res.ok da false enviamos error
      return await res.json(); // devolvemos el array de categorias como objeto de javaScript (res.json lo transforma de json a javascript)
    }
  

  async getCategoryById(id: number): Promise<CategoryId> { //recibe un id como parametro y promete devolver una category
    const res = await fetch(`${this.baseUrl}/categories/${id}`, { // construimos la url dinamica solicitando solo la informacion de una category (${id})
      method: 'GET', 
      headers: this.authService.getAuthHeaders()
    });
      if(!res.ok) throw new Error("Error al obtener la categoria");
      return await res.json();
    }

  

async createCategory(categoryData: Category): Promise<CategoryId> { // recibe un objeto con la data de la categoria y promete devolver un categoryId asignado por la base de datos
   const res = await fetch (`${this.baseUrl}/categories`, { // creamos la url en categories pero no le pasamos un parametro pq no existe
    method: 'POST', // enviamos metodo para crear un nuevo recurso
    headers: this.authService.getAuthHeaders(),
    body: JSON.stringify(categoryData) // convierte el archivo javascript a json para que viaje a traves de internet
  });
  if (!res.ok) throw new Error("Error al crear categoría");
    return await res.json();
  }

async updateCategory(id: number, categoryData: Category): Promise<any> { // recibe dos parametros: el id de la cat y el objeto con la data a actualizar
    const res = await fetch (`${this.baseUrl}/categories/${id}`, { // crea la url accediendo al id especifico de la cat
      method: 'PUT', // enviamos el metodo para reemplazar el antiguo objeto con el nuevo
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });
if (!res.ok) throw new Error("Error al actualizar categoría");
    return await res.json(); // O void si no devuelve nada
  }


async deleteCategory(id: number): Promise<void> { // recibe el id de la cat como parametro
    const res = await fetch (`${this.baseUrl}/categories/${id}`, { // creamos la url accediendo a una categoria especifica
      method: 'DELETE', // enviamos metodo para eliminar la categoria
      headers: this.authService.getAuthHeaders(),
      }); 
      if(!res.ok) throw new Error("Error al eliminar categoría");
    }
  }
