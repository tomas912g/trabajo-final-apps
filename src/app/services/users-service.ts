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
  
  async register(registerData: NewUser) { // reccibe register data (datos del nuevo usuario)
    const res = await fetch(this.URL_BASE, // hacemos el fetch a la URL y le enviamos la peticion
    { 
      method: "POST", 
      headers: {
        "Content-Type": "application/json" // usamos headers manuales en vez de llamar al auth porque todavia no existe token
      },
      body: JSON.stringify(registerData) // pasamos de JS a JSON para enviar los datos
    });
  if (!res.ok){ 
      throw new Error("Error al registrar usuario"); 
    }
    try {return await res.json(); // intento A el servidor devuleve los datos del usuario creado
    } catch{
      return {ok: true}; // intento B el servidor creo el usuario pero no devuelve nada, hacemos catch para que no explote el sistema
    }
  }

    async getUserProfile(userId: number): Promise<User> { // recibe el id de un usuario y promete devolver el user
      const res = await fetch(`${this.URL_BASE}/${userId}`, // usa la url base y pega el id q buscamos
      {
        method: "GET", // envia metodo para leer y la autorizacion (token)
        headers: this.authService.getAuthHeaders()
      });
        if (!res.ok) throw new Error("Error al buscar el perfil"); 
        return await res.json();
    }
  
  async userProfileUpdate(userId: number, data: Partial<NewUser>): Promise<void>{ // recibe id de usuario y el partial de la data que hace que todas las propiedades se vuelvan opcionales para no tener que enviar todas al actualizar unas pocas cosas
    const res = await fetch(`${this.URL_BASE}/${userId}`, { // hacemos peticion a la url apuntando a el usuario especifio
      method: "PUT",
      headers: this.authService.getAuthHeaders(), 
      body: JSON.stringify(data) // convertimos el pedacito de data y lo transformamos a JSON para enviarlo
    });

    if (!res.ok) throw new Error("Error al querer actualizar el perfil")
  } 

  async deleteUserProfile(userId: number): Promise<void>{ // recibe el id del usuario a eliminar
    const res = await fetch(`${this.URL_BASE}/${userId}`,{  // envia el metodo delete al id especifico de la url
      method: "DELETE",
      headers: this.authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al querer eliminar el perfil")
  }
}

