import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; //formControl es que el que agrupa cada dato por individual y el formGroup todos juntos
import { Router } from '@angular/router';
import { UsersService } from '../../services/users-service'; // Servicio que maneja usuarios
import { User, NewUser } from '../../interfaces/user'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-settings.html',
  styleUrls: ['./account-settings.scss']
})
export class AccountSettingsComponent implements OnInit {
  private usersService = inject(UsersService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  editForm!: FormGroup;
  user: User | undefined;
  isLoading = true;
  error: string | null = null;

ngOnInit(): void {
    //llama a loadAccountData
    this.loadAccountData(); 
}
    /* Carga la info actual del usuario logueado*/
async loadAccountData(): Promise<void> {
    this.isLoading = true;
    const userId = this.authService.currentUserId; // Obtiene el ID del usuario actual
    if (!userId) return;
    try {
      const data = await this.usersService.getUserProfile(userId); 
        this.user = data; 
        this.initForm(data); 
    } catch (e) {
        this.router.navigate(['/login']); // lo manda a login si falla
    } finally {
        this.isLoading = false;
    }
}

  // inicia el form de edición con datos del usuario
  initForm(user: User) {
    this.editForm = this.fb.group({
      name: [user.firstName, Validators.required],
      lastName: [user.lastName, Validators.required],
      restaurant: [user.restaurantName, Validators.required],
      address: [user.address, Validators.required],
      phone: [user.phoneNumber, Validators.required],
      newPassword: [''], 
    });
  }

  /* Envía los cambios al servidor*/
async onUpdateAccount(): Promise<void> {
    if (this.editForm.invalid) return; // se frena si hay campos obligatorios vacíos
    this.isLoading = true;
    this.error = null;
    //obtiene todos los valores del formulario
    const changes: Partial<NewUser> = this.editForm.getRawValue(); 
    const userId = this.authService.currentUserId; // Obtenemos ID
    if (!userId) return;

    try {
      //espera a que el servidor actualice la información
      await this.usersService.userProfileUpdate(userId, changes); 
      alert('Cuenta actualizada con éxito!');
    } catch (e) {
      this.error = 'Error al actualizar. Verifique que los datos sean correctos.';
    } finally {
      this.isLoading = false;
    }
  }

  /*Elimina la cuenta y la sesión*/
async onDeleteAccount(): Promise<void> {
  const userId = this.authService.currentUserId; // Obtenemos ID
  if (!userId) return;
    if (!confirm('¿Está seguro de que desea eliminar su cuenta? Esta acción es PERMANENTE.')) {
      return;
    }
    this.isLoading = true;
    this.error = null;
    try {
      // 🟢 await: Espera a que el servidor elimine la cuenta y el token local
      await this.usersService.deleteUserProfile(userId); 
      alert('Cuenta eliminada con éxito. Sesión cerrada.');
      this.router.navigate(['/']); // Redirigir al inicio/login
    } catch (e) {
      this.error = 'Error al intentar eliminar la cuenta.';
    } finally {
      this.isLoading = false;
    }
  }
}
