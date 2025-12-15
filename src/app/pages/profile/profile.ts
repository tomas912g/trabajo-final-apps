import { Component, inject, OnInit } from '@angular/core';
import { UsersService } from '../../services/users-service';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NewUser } from '../../interfaces/user';
import Swal from 'sweetalert2';
import { Spinner } from '../../components/spinner/spinner';
@Component({
  selector: 'app-profile',
  imports: [Spinner, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit{
  userService = inject(UsersService);
  router = inject(Router);

  isLoading = true;
  userId!: number;

  dataProfile: NewUser = {
    restaurantName: "",
    address: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: ""
  };

  // cree una instancia personalizada de SweetAlert que ya trae las clases de Bootstrap configuradas
  //esto esta documentado en la pagina oficial de la librería como la "Manera recomendada"  
  // para mantener la consistencia visual del diseño sin agregar dependencias pesadas
  // Fuente: https://sweetalert2.github.io/#bootstrap-integration
  private swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success me-2",
      cancelButton: "btn btn-danger"
    },
    buttonsStyling: false
  });

  ngOnInit(): void {
    const storedId = localStorage.getItem("userId");
    if (!storedId){
      this.router.navigate(["/login"]);
      return;
    }
    this.userId = +storedId;
    this.summitData();
  }

  async summitData(){
    this.isLoading = true;
    try{
      const user = await this.userService.getUserProfile(this.userId);

      this.dataProfile.restaurantName = user.restaurantName;
      this.dataProfile.address = user.address || "";
      this.dataProfile.password = ""; //contraseña vacia a proposito
      } catch (error){
        console.error(error);
        this.router.navigate(['/login']);
        } finally{
          this.isLoading = false;
    }
  }

  async saveChanges(form: NgForm){
    if(form.invalid) return;

    this.isLoading = true;
    try{
      const datos: any = { ...this.dataProfile }; //copia de datos 
      if(datos.password == ""){
        delete datos.password}
    
    await this.userService.userProfileUpdate(this.userId, datos);
      
    this.swalWithBootstrapButtons.fire({
        title: "¡Actualizado!",
        text: "Tu perfil se actualizó correctamente",
        icon: "success"
      });

      } catch (error) {
      this.swalWithBootstrapButtons.fire({
        title: "Error",
        text: "No se pudieron guardar los cambios",
        icon: "error"
      });
    } finally {
      this.isLoading = false;
    }
  }

  async deleteAccount() {
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
      try {
        await this.userService.deleteUserProfil(this.userId);
        localStorage.clear();
        
        await this.swalWithBootstrapButtons.fire({
          title: "¡Eliminado!",
          text: "Tu cuenta ha sido borrada.",
          icon: "success"
        });

        this.router.navigate(["/login"]);
      } catch (error) {
        this.swalWithBootstrapButtons.fire({
          title: "Error",
          text: "No se pudo eliminar la cuenta",
          icon: "error"
        });
    }
  }
}
}