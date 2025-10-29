import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login { 
    login(form: NgForm) {
        if (form.invalid) {
            console.error('El formulario es inválido.');
            return;
        }
        // Obtiene los datos del formulario: { email: '...', password: '...' }
        const credenciales = form.value;

        console.log('Credenciales a enviar:', credenciales);
    }
}
