import { Component, inject } from '@angular/core';
import { FormsModule,  NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NewUser } from '../../interfaces/user';
import { UsersService } from '../../services/users-service';

@Component({
  selector: 'app-register',
  imports: [RouterModule, FormsModule],
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
    const { email, password, password2, restaurant, address } = form.value as any;
    if (!email ||
      !password ||
      !password2 || 
      !restaurant ||
      !address ||
      form.value.password !== form.value.password2) {
      this.errorRegister = true;
      return
    }
  this.isLoading = true;
  try {
    const payload: NewUser = { email, password, restaurant, address };
    const res = await this.usersService.register(payload);
    if (res?.ok) {
      this.router.navigate(['/login']);
      return;
    }
    this.errorRegister = true;
  } finally {
    this.isLoading = false;
  }
}
}

