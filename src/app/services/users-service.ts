import { Injectable, inject } from '@angular/core';
import { NewUser } from '../interfaces/user';
import { User } from '../interfaces/user';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  authService = inject(AuthService);
  readonly URL_BASE = 'https://w370351.ferozo.com/api/users';
  
  async register(registerData: NewUser) { 
    const res = await fetch(this.URL_BASE,
    { 
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registerData) 
    });
  if (!res.ok){ 
      throw new Error("Error al registrar usuario"); 
    }
    try {return await res.json();
    } catch{
      return {ok: true};
    }
  }

  async getUserProfile(userId: number): Promise<User> { 
    const res = await fetch(`${this.URL_BASE}/${userId}`, 
    {
      method: "GET", 
      headers: this.authService.getAuthHeaders()
    });
      if (!res.ok) throw new Error("Error al buscar el perfil");
      return await res.json();
  }
  
  async userProfileUpdate(userId: number, data: Partial<NewUser>): Promise<void>{ 
    const res = await fetch(`${this.URL_BASE}/${userId}`, {
      method: "PUT",
      headers: this.authService.getAuthHeaders(), 
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Error al querer actualizar el perfil")
  } 

  async deleteUserProfile(userId: number): Promise<void>{
    const res = await fetch(`${this.URL_BASE}/${userId}`,{ 
      method: "DELETE",
      headers: this.authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al querer eliminar el perfil")
  }
}

