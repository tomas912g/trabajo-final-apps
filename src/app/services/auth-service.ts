import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { logindata } from '../interfaces/auth';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  router = inject(Router)
  token: null|string = localStorage.getItem("token");
  revisionTokenInterval:number|undefined;

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

  ngOnInit(): void{
    if(this.token){
      this.revisionTokenInterval = this.revisionToken()
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
        const base64Url = this.token.split('.')[1]; 
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); 
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) { 
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); 
        }).join(''));

        const claims: { exp: number } = JSON.parse(jsonPayload); 
        if (new Date(claims.exp * 1000) < new Date()) {
          this.logout()
        }
      }
    }, 10000) 
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
