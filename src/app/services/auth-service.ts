import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { logindata } from '../interfaces/auth';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  router = inject(Router)
  token: string|null = localStorage.getItem("token");
  revisionTokenInterval:number|undefined;

  constructor() {
    if(this.token){
      this.revisionTokenInterval = this.revisionToken()
    }
  }

  getAuthHeaders(): { [key: string]: string } { // El objeto puede tener cualquier cant de propiedades con claves y valores string
    let currentToken = this.token;
    if (currentToken && currentToken.includes('"token"')) {
      try {
        const parsed = JSON.parse(currentToken) //Convierte un string JSON en un objeto JavaScript.
        currentToken = parsed.token;
    } catch(e){
         console.error("Error limpiando el token:", e);
       }
    }
    if (!currentToken){ //ejecuta si no hay token
      return { 'Content-Type': 'application/json' }; // Devuelve los headers HTTP indicando que el contenido es JSON
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}` 
    };
  }
    

  get currentUserId(): number | null { 
    if (!this.token) return null; 
    try {
      const payload = this.parseJwt(this.token);
      return Number(payload.id || payload.sub || payload.userId);
    } catch (error) {
      console.error("Error al leer ID:", error);
      return null;
    }
  }

  
  async login(loginData: logindata){
    const res = await fetch("https://w370351.ferozo.com/api/Authentication/login",
    {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(loginData)
    }
  )
  if(res.ok){
    this.token = await res.text()
    localStorage.setItem("token", this.token)
    this.revisionTokenInterval = this.revisionToken();
    return true;
  } else {
    return false
  }
}

  logout(){
    this.token = null;
    localStorage.removeItem("token");
    this.router.navigate(["/login"])
  }


  revisionToken() {
    return setInterval(() => {
      if (this.token) {
        try { 
          const claims = this.parseJwt(this.token);
          if (claims.exp && (new Date (claims.exp * 1000) < new Date())){
          this.logout();
      }
        } catch (e){
          this.logout(); // Si el token está corrupto, se cierra cesion
      }
    }
    }, 10000);
  }
  
  parseJwt(token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }
}

