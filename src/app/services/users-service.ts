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

  getAuthHeaders(){
    const token = this.authService.token || localStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
  };
}
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
    try{
      return await res.json();
    } catch{
      return {ok: true};
    }
  }

  //2 obtener datos
  async getUserProfile(userId: number): Promise<User> {
    const res = await fetch(`${this.URL_BASE}/${userId}`, 
    {
      method: "GET",
      headers: this.getAuthHeaders()});

      if (!res.ok) throw new Error("Error al buscar el perfil");
      return await res.json();
  }
  
  //3 actualizar datos
  async userProfileUpdate(userId: number, data: Partial<NewUser>): Promise<void>{ //gracias al void no hacemos return
    const res = await fetch(`${this.URL_BASE}/${userId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Error al querer actualizar el perfil")
  }

  //4 eliminar cuenta
  async deleteUserProfile(userId: number): Promise<void>{
    const res = await fetch(`${this.URL_BASE}/${userId}`,{
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al querer eliminar el perfil")
  }
}

