import { Component, inject } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { FormsModule, NgForm } from '@angular/forms';
import { Spinner } from "../../components/spinner/spinner";
import { AuthService } from '../../services/auth-service';
import { logindata } from '../../interfaces/auth';

@Component({
  selector: 'app-login-page',
  imports: [RouterModule, FormsModule, Spinner],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  errorLogin = false; // se pone en true si la contraseña es incorrecta
  authService = inject(AuthService) 
  isLoading = false; // controla si mostramos el spinner o el boton de ingresar
  router = inject(Router)

  async login(form:NgForm){ // recibe el formulario completo (Ngform) desde el HTML
    this.errorLogin = false; // reseteamos el error por si hubo un fallo anterior
    if(!form.value.restaurantName || !form.value.password){ // si hay algun cambio vacio en el formulario no hacemos nada (return)
      return
    }

    this.isLoading = true; // activamos spinner
    // transformamos el restaurant name en un email para que el back lo acepte
    const cleanName = form.value.restaurantName.replace(/\s+/g, '').toLowerCase(); // toma el nombre del restaurante, elimina los espacios y lo pone todo en minusculas
    const fakeEmail = `${cleanName}@sin-email.com`; // agrega el @sin-email.com al nombre que modificamos antes para cumplir el requisito del backend
    const loginData: logindata = { // empaqueta los nuevos datos modificados (falsoemail)
      email: fakeEmail,
      password : form.value.password,
      restaurantName: form.value.restaurantName,
    }
    try{
    const loginExitos = await this.authService.login(loginData); // intentamos hacer el logueo enviando los datos empaquetados y esperamos la respuesta (await)
    if(loginExitos){ // si el servicio da true
      this.router.navigate(['/']); // si es exitoso nos redirige a el home
    } else{ // si el servicio da false
    this.errorLogin = true; // muestra un mensaje de error
    }
    }
    catch(error){ // se ejecuta si el servidor explota o hay un fallo externo (internet)
      console.error(error);
      this.errorLogin = true;
    } finally{ // se ejecuta sin importar lo que pase
      this.isLoading = false; // frenamos el spinner para que la pantalla no se quede congelada
    }
  }
}
