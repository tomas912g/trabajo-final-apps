import { Component, inject } from '@angular/core';
import { FormsModule,  NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NewUser } from '../../interfaces/user';
import { UsersService } from '../../services/users-service';
import { Spinner } from '../../components/spinner/spinner';

@Component({
  selector: 'app-register',
  imports: [RouterModule, FormsModule, Spinner],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})

export class Register {
  errorRegister = false; // ponemos el error en falso, se activa si faltan datos o la contraseña es incorrecta
  usersService = inject(UsersService);
  isLoading = false; // controla si mostramos el spinner o el boton de ingresar
  router = inject(Router);

  async register(form: NgForm) {
    this.errorRegister = false; // reseteamos errores previos si los hubo
    // ponemos todas la variables y le decimos al programa que confie en que esten en el formulario usando el as any
    const { firstName, lastName, password, password2, restaurantName, address, phoneNumber } = form.value as any;
    if (!firstName ||  //verificamos que ningun cambio este vacio y que ambas contraseñas sean iguales
      !lastName ||
      !password ||
      !password2 || 
      !restaurantName ||
      !phoneNumber ||
      !address ||
      form.value.password !== form.value.password2) {
      this.errorRegister = true; // si algo falla, mostramos error y da return
      return
    }
  this.isLoading = true; // activamos spinner
  try {
    // utilizamos la creacion del falso email (igual que en el login)
    const cleanName = restaurantName.toLowerCase().replace(/\s+/g, ''); // toma el nombre del restaurante, elimina los espacios y lo pone todo en minusculas
    const fakeEmail = `${cleanName}@sin-email.com` // agrega el @sin-email.com al nombre que modificamos antes para cumplir el requisito del backend
    
    // creamos el paquete de datos payload con todos los datos que necesita guardar el back
    const payload: NewUser = { firstName, lastName, email: fakeEmail, password, restaurantName, address, phoneNumber };
    const res = await this.usersService.register(payload); // llamamos al servicio y le pasamos la funcion register (method: POST)

    if (res?.ok || res?.id) { // si cualquiera de las respuestas es true pasa
      this.router.navigate(['/login']); // redirigimos al usuario para que inicie sesion
      return;
    }
    this.errorRegister = true;
    } catch (e) { // si hubo error de red o de validacion
    console.error(e);
    this.errorRegister = true; 
  } finally { // pase lo que pase frenamos el spinner
    this.isLoading = false;
  }
}
}

