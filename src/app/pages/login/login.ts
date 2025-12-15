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
  errorLogin = false;
  authService = inject(AuthService)  
  isLoading = false;
  router = inject(Router)

  async login(form:NgForm){
    this.errorLogin = false;
    if(!form.value.restaurantName || !form.value.password){
      return
    }

    this.isLoading = true;
    const cleanName = form.value.restaurantName.replace(/\s+/g, '').toLowerCase();
    const fakeEmail = `${cleanName}@sin-email.com`;
    const loginData: logindata = {
      email: fakeEmail,
      password : form.value.password,
      restaurantName: form.value.restaurantName,
    }
    try{
    const loginExitos = await this.authService.login(loginData);
    if(loginExitos){
      this.router.navigate(['/']);
    } else{
    this.errorLogin = true;
    }
    }
    catch(error){
      console.error(error);
      this.errorLogin = true;
    } finally{
      this.isLoading = false;
    }
  }
}
