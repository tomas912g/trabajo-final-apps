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
  // verificacion de token valido
  getAuthHeaders(){
    const token = this.authService.token || localStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
  };
}
  async register(registerData: NewUser) { // argumnto registerData de tipo NweUser
    const res = await fetch(this.URL_BASE,
    { 
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registerData) // convierte el objeto registerData en una cadena JSON
    });
  if (!res.ok){ // manejo de errores
      throw new Error("Error al registrar usuario"); 
    }
    try{
      return await res.json();
    } catch{
      return {ok: true};
    }
  }

  //2 obtener datos
  async getUserProfile(userId: number): Promise<User> { // recibe el userId y devuelve un objeto tipo User
    const res = await fetch(`${this.URL_BASE}/${userId}`, 
    {
      method: "GET", // metodo estandar para ver un recurso
      headers: this.getAuthHeaders()});//llama a la funcionn getAuthHeaders()

      if (!res.ok) throw new Error("Error al buscar el perfil");// si la respuesta no es exitosa manda un error
      return await res.json();// si fue exitosa lee el cuerpo de la respuesta como JSON y devuelve el objeto User
  }
  
  //3 actualizar datos
  async userProfileUpdate(userId: number, data: Partial<NewUser>): Promise<void>{ //requiere el userId y data
    const res = await fetch(`${this.URL_BASE}/${userId}`, {//inicia un fetch a la URL del usuario especifico
      method: "PUT",//metodo estandar para reemplazar o actualizar un recurso
      headers: this.getAuthHeaders(), //incluye el token de autenticacion
      body: JSON.stringify(data)//manda los datos de actualización convertidos a JSON
    });

    if (!res.ok) throw new Error("Error al querer actualizar el perfil")
  } //gracias al void no hacemos return

  //4 eliminar cuenta
  async deleteUserProfile(userId: number): Promise<void>{//requiere el userId
    const res = await fetch(`${this.URL_BASE}/${userId}`,{ //inicia un fetch a la URL del usuario especifico
      method: "DELETE",
      headers: this.getAuthHeaders(),//incluye el token de autenticacion, ya que solo el usuario autenticado puede eliminar su propia cuenta.
    });
    if (!res.ok) throw new Error("Error al querer eliminar el perfil")
  }
}

