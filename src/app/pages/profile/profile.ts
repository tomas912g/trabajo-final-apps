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
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: ""
  };

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
      this.dataProfile.firstName = user.firstName;
      this.dataProfile.lastName = user.lastName;
      this.dataProfile.phoneNumber = user.phoneNumber;
      this.dataProfile.email = user.email
      this.dataProfile.address = user.address || "";
      this.dataProfile.password = ""; 
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
      const datos: any = { ...this.dataProfile }; 
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
        await this.userService.deleteUserProfile(this.userId);
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