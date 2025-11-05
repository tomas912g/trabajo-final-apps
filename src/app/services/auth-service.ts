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

  ngOnInit(): void{
    //si tengo sesion iniciado verifico que no este vencida
    if(this.token){
      this.revisionTokenInterval = this.revisionToken()
    }
  }
  
  async login(loginData: logindata){
    const res = await fetch("",
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
      if (this.token) { //solo se ejecuta si existe
        const base64Url = this.token.split('.')[1]; //Aísla la segunda parte del token
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); //Corrigen para que sea compatible con el estándar Base64 que usa JavaScript (window.atob())
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) { //decodifica la cadena Base64 a una cadena JSON legible.
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); 
          // transformación de caracteres que forma parte del proceso de decodificación de la segunda parte de un Token Web JSON
        }).join(''));

        const claims: { exp: number } = JSON.parse(jsonPayload); //Convierte la cadena JSON decodificada en un objeto de JavaScript. Se extrae el valor del claim exp, que es el tiempo de expiración del token
        if (new Date(claims.exp * 1000) < new Date()) { 
          //Convierte la fecha de expiración (exp) de segundos a milisegundos. Lo que espera new Date()
          //Esta es la lógica central. La fecha de expiración del token es menor que la fecha y hora actuales
          this.logout()
        }
      }
    }, 10000) //la funcion se ejecute cada estos segundos
  }
}
