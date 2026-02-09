import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { logindata } from '../interfaces/auth';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  router = inject(Router)
  token: string|null = localStorage.getItem("token"); // Revisamos si ya existia un token guardado en el localstorage, si existe se guarda en la variable y sino queda como null
  revisionTokenInterval:number|undefined; //Revisa si el token se vencio

  constructor() { // Se ejecuta una sola vez al crear el servicio
    if(this.token){ // si ya hay token se activa la revision del token para evaluar vigencia
      this.revisionTokenInterval = this.revisionToken()
    }
  }

  getAuthHeaders(): { [key: string]: string } { // El objeto puede tener cualquier cant de propiedades con claves y valores string
    let currentToken = this.token; // creamos copia del token para manipularla sin tocar el original
    if (currentToken && currentToken.includes('"token"')) { // este if detecta si el token esta "sucio"
      try {
        const parsed = JSON.parse(currentToken) //Convierte un string JSON en un objeto JavaScript.
        currentToken = parsed.token; // sobreescribe la variable con el token limpio
    } catch(e){ // si falla el parseo se activa la consola sin romper la app
         console.error("Error limpiando el token:", e);
       }
    }
    if (!currentToken){ //ejecuta si no hay token
      return { 'Content-Type': 'application/json' }; // Devuelve los headers HTTP basicos indicando que el contenido es JSON
    }
    return { // si hay token devolvemos el objeto con las claves necesarias
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${currentToken}` // 'Authorization': Es la cabecera estándar de seguridad.
                                                // 'Bearer': Es el esquema de autenticación. El portador de este token tiene permiso.
    };
  }
    
 // el get la convierte en una propiedad calculada, puede ser llamada sin ()
  get currentUserId(): number | null { //define que puede devolver un number (id) o null
    if (!this.token) return null; // si la variable this.token esta vacia, cortamos ejecucion y devolvemos null
    try {
      const payload = this.parseJwt(this.token); //Llamamos a parseJWT pasandole el token encriptado y devuelve un JSON con los datos de usuario
      return Number(payload.id || payload.sub || payload.userId); // Buscamos el id en tres lugares mediante '||' y se queda con el primero que no sea vacio
      // envuelve el id en Number()
    } catch (error) { // si falla algo dentro del try se activa la consola sin romper la app
      console.error("Error al leer ID:", error);
      return null; // hacemos un retorno seguro devolviendo null
    }
  }

  // usamos async pq espera una respuesta de internet
  async login(loginData: logindata){ // recibe loginData (email y password)
    const res = await fetch("https://w370351.ferozo.com/api/Authentication/login", // hace peticion al servidor y espera a que responda (await)
    {
      method: "POST", // envia la info para crear una sesion
      headers: {'Content-Type': 'application/json'}, // avisamos al servidor que los headers son en formato JSON
      body: JSON.stringify(loginData) //toma el objeto de javaScript y lo convierte a string
    }
  )
  if(res.ok){ // 'res.ok' es un truco de fetch. Es 'true' si el código de respuesta es 200-299 y false si es 400, 401, 500
    this.token = await res.text() // extraemos el token usando res.text porque la api lo devuelve como un texto y no como un JSON
    localStorage.setItem("token", this.token) // guardamos el token en el localstorage
    this.revisionTokenInterval = this.revisionToken(); // chequea que el item siga vigente
    return true;
  } else { // si es positivo devolvemos true y sino maneja el error y devuelve false
    return false
  }
}

  logout(){ // es una funcion simple que no recibe parametros porque sus tareas son inmediatas (borrar variables)
    this.token = null; // pone el token en null para que cualquier parte de la app que pida por el token reciba null
    localStorage.removeItem("token"); // Borra el token del localStorage
    this.router.navigate(["/login"]) // Termina redireccionando al login
  }


  revisionToken() {
    return setInterval(() => { // 'setInterval' ejecuta el código de adentro repetidamente cada X milisegundos. devuelve un id 
      if (this.token) {
        try { 
          const claims = this.parseJwt(this.token); // convertimos el string encriptado en un JSON legible
          if (claims.exp && (new Date (claims.exp * 1000) < new Date())){ // Compara si la fecha de vencimiento (claim.exp) del token (pasada a milisegundos) es anterior al momento actual(newDate), lo que significa que ya venció.
          this.logout(); // si se cumple la condicion (token vencido) forzamos el logout
      }
        } catch (e){
          this.logout(); // Si el token está corrupto (parseJWT falla), se cierra cesion
      }
    }
    }, 10000); // frecuencia de revision, 10000ms = 10seg
  }
  
  parseJwt(token: string) { // recibe el token y devuelve JSON 
    var base64Url = token.split('.')[1]; // split corta el array del token en 3 puntos distintos (header.payload.signature) y se queda con el indice [1]
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // hace reemplazo de guiones por mas y menos para que el navegador pueda codificarlo
    // Esta línea  para decodificar Base64 soportando caracteres especiales
    // - 'window.atob(base64)': Decodifica la base64 a una cadena binaria cruda.
    // - '.map(...)': Convierte cada caracter en su código hexadecimal con un '%' delante (ej: '%C3%B1' para la ñ).
    // - 'decodeURIComponent(...)': Toma esos códigos y los transforma en el texto correcto y legible.
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) { 
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload); // cambia jsonpayload en un objeto real json.parse para poder hacer llamado a su id
  }
}

