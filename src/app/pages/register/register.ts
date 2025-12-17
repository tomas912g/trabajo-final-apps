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
  errorRegister = false;
  usersService = inject(UsersService);
  isLoading = false;
  router = inject(Router);

  async register(form: NgForm) {
    console.log(form.value);
    this.errorRegister = false;
    const { firstName, lastName, password, password2, restaurantName, address, phoneNumber } = form.value as any;
    if (!firstName ||
      !lastName ||
      !password ||
      !password2 || 
      !restaurantName ||
      !phoneNumber ||
      !address ||
      form.value.password !== form.value.password2) {
      this.errorRegister = true;
      return
    }
  this.isLoading = true;
  try {
    const randomId = Date.now(); 
    const cleanName = restaurantName.toLowerCase().replace(/\s+/g, '');
    const fakeEmail = `${cleanName}@sin-email.com`
                  
    const payload: NewUser = { firstName, lastName, email: fakeEmail, password, restaurantName, address, phoneNumber };
    console.log("enviando payload", payload);
    const res = await this.usersService.register(payload);
    if (res?.ok || res?.id) {
      this.router.navigate(['/login']);
      return;
    }
    this.errorRegister = true;
    } catch (e) {
    console.error(e);
    this.errorRegister = true;
  } finally {
    this.isLoading = false;
  }
}
}

