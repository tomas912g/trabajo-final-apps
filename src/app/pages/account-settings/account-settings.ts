import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { UsersService } from '../../services/users-service'; 
import { User, NewUser } from '../../interfaces/user'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-settings.html',
  styleUrls: ['./account-settings.scss']
})
export class AccountSettingsComponent implements OnInit {
  // trae las herramientas necesarias para que el componente funcione
  private usersService = inject(UsersService);// serv. que pide o edita datos de usuario
  private router = inject(Router);// serv. que redirige el usuario a otras pags.
  private fb = inject(FormBuilder);// serv. para construir y validar el form
  public authService = inject(AuthService);// verificar identidad y permisos de usuario
  
  //propiedades del componente
  editForm!: FormGroup; //objeto que controla el formulario
  user: User | undefined; //almacena los datos del usuario obtenidos de la interfaz User
  isLoading = true;
  error: string | null = null; //guarda el mensaje de error si falla

  private swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success me-2",
      cancelButton: "btn btn-danger"
    },
    buttonsStyling: false
  });

ngOnInit(): void {
    this.loadAccountData(); // llama a la funcion que trae los datos apenas carga la pagina
}

async loadAccountData(): Promise<void> {
    this.isLoading = true;
    const userId = this.authService.currentUserId; //llama al auth para obtener el token
    if (!userId) return; // si no hay usuario para el metodo
    try {
      const data = await this.usersService.getUserProfile(userId); 
        this.user = data; //guarda los datos en la variable user
        this.initForm(data); //pasa los datos al formulario
    } catch (e) {
        this.router.navigate(['/login']); // si hay error, lo manda a login
    } finally {
        this.isLoading = false;
    }
}

// pega los datos que legan del usuario dentro del formulario
  initForm(user: User) {
    this.editForm = this.fb.group({ //crea el grupo de requerimientos del formulario y asigna valores y reglas
      firstName: [user.firstName, Validators.required],
      lastName: [user.lastName, Validators.required],
      restaurantName: [user.restaurantName, Validators.required],
      address: [user.address, Validators.required],
      phoneNumber: [user.phoneNumber, Validators.required],
      Password: [''], // inicia vacio porque el usuario decide si cambiarla o no
    });
  }

//procesa el envio del formulario
async onUpdateAccount(): Promise<void> {
    if (this.editForm.invalid) return;// si el formulario tiene errores frena el metodo 
    this.isLoading = true;
    const formValues = this.editForm.getRawValue();
    const changes: Partial<NewUser> ={ ...formValues };; //extrae todos los valores actuales del formulario
    if (!changes.password) {
        delete changes.password; // Borramos el campo si está vacío
    }

    const userId = this.authService.currentUserId;//guarda el ID del usuario logeado para saber a quien cambiar
    if (!userId) return;
    try {
      await this.usersService.userProfileUpdate(userId, changes); //llama al servicio para enviar los cambios
      // Alerta  de Éxito
      this.swalWithBootstrapButtons.fire({
        title: "¡Actualizado!",
        text: "Tu perfil se actualizó correctamente",
        icon: "success"
      });
    } catch (e) {
      console.error(e);
        this.swalWithBootstrapButtons.fire({
        title: "Error",
        text: "No se pudieron guardar los cambios",
        icon: "error"
      });
    } finally {
      this.isLoading = false;
    }
  }

async onDeleteAccount(): Promise<void> {
  const userId = this.authService.currentUserId;//guarda el ID actual para saber que usario eliminar
  if (!userId) return;// si no existe el ID frena el metodo
  const result = await this.swalWithBootstrapButtons.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto y perderás tu menú.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar cuenta",
      cancelButtonText: "Cancelar",
      reverseButtons: true
    });
    if (result.isConfirmed) {
      this.isLoading = true;
      try {
          await this.usersService.deleteUserProfile(userId);
          localStorage.clear(); // Limpiar sesión
          
          await this.swalWithBootstrapButtons.fire({
             title: "¡Eliminado!",
             text: "Tu cuenta ha sido borrada.",
             icon: "success"
           });
           this.router.navigate(['/login']);
    } catch (e) {
            this.swalWithBootstrapButtons.fire({
                title: "Error",
                text: "No se pudo eliminar la cuenta",
                icon: "error"
              });
            this.isLoading = false;
        }
      }
    }
  }

 
