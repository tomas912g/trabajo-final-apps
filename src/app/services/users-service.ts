import { Injectable } from '@angular/core';
import { NewUser } from '../interfaces/user';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'https://agenda-api.somee.com/api/Users';
  async register(registerData: NewUser) {
    const res = await fetch("https://agenda-api.somee.com/api/Users",
    { 
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registerData)
    });
  const data = await res.json();
  return { ok: res.ok, ...data };
  }

  async getAccountData(): Promise<User> {
    const token = localStorage.getItem('authToken'); 
    if (!token) {
        // si no hay token, lanza un error para que el componente redirija al login
        throw new Error('Usuario no autenticado.');
    }
    const res = await fetch(`${this.apiUrl}/mi-cuenta`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, //envía el token de autenticación
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al obtener los datos de la cuenta');// si la respuesta HTTP no es 200, lanza un error
    }
    const data: User = await res.json();
    return data; //devuelve el objeto User
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken'); 
  }

  async updateAccount(changes: Partial<NewUser>): Promise<any> {
    const token = this.getAuthToken();
    if (!token) {
        throw new Error('No autorizado: Usuario no encontrado');
    }
    const res = await fetch(`${this.apiUrl}/mi-cuenta`, {
        method: 'PUT', 
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes)
    });

    if (!res.ok) {
        throw new Error('Error al actualizar la cuenta.');
    }
    return res.json(); //devuelve la respuesta del servidor 
  }

  async deleteAccount(): Promise<void> {
    const token = this.getAuthToken();
    if (!token) {
        throw new Error('No autorizado: Usuario no encontrado');
    }
    const res = await fetch(`${this.apiUrl}/mi-cuenta`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error('Error al eliminar la cuenta.');
    }
    //limpia el token de sesión después de la eliminación exitosa
    localStorage.removeItem('authToken'); 
  }
}

