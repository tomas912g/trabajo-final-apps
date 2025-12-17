import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { UsersService } from '../../services/users-service'; 
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
    this.loadAccountData(); 
}

async loadAccountData(): Promise<void> {
    this.isLoading = true;
    const userId = this.authService.currentUserId; 
    if (!userId) return;
    try {
      const data = await this.usersService.getUserProfile(userId); 
        this.user = data; 
        this.initForm(data); 
    } catch (e) {
        this.router.navigate(['/login']);
    } finally {
        this.isLoading = false;
    }
}


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

async onUpdateAccount(): Promise<void> {
    if (this.editForm.invalid) return; 
    this.isLoading = true;
    this.error = null;
    const changes: Partial<NewUser> = this.editForm.getRawValue(); 
    const userId = this.authService.currentUserId;
    if (!userId) return;

    try {
      await this.usersService.userProfileUpdate(userId, changes); 
      alert('Cuenta actualizada con éxito!');
    } catch (e) {
      this.error = 'Error al actualizar. Verifique que los datos sean correctos.';
    } finally {
      this.isLoading = false;
    }
  }

async onDeleteAccount(): Promise<void> {
  const userId = this.authService.currentUserId;
  if (!userId) return;
    if (!confirm('¿Está seguro de que desea eliminar su cuenta? Esta acción es PERMANENTE.')) {
      return;
    }
    this.isLoading = true;
    this.error = null;
    try {
      await this.usersService.deleteUserProfile(userId); 
      alert('Cuenta eliminada con éxito. Sesión cerrada.');
      this.router.navigate(['/login']); 
    } catch (e) {
      this.error = 'Error al intentar eliminar la cuenta.';
    } finally {
      this.isLoading = false;
    }
  }
}
