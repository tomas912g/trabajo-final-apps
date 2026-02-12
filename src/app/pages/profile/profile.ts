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
  //objeto que almacena info del perfil (inicializada vacia)
  dataProfile: NewUser = {
    restaurantName: "",
    address: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: ""
  };
  //configuracion para alertas con estilos de Bootstrap
  private swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success me-2",
      cancelButton: "btn btn-danger"
    },
    buttonsStyling: false//desactiva el estilo de sweetAlert para usar el de Bootstrap
  });

  ngOnInit(): void {
    const storedId = localStorage.getItem("userId");//recupera el ID del usuario almacenado en localStorage
    if (!storedId){//si no lo encuentra, lo manda a login
      this.router.navigate(["/login"]);
      return;
    }
    //si existe ID, lo pasa a numero y carga los datos del perfil
    this.userId = +storedId;
    this.summitData();
  }

  async summitData(){
    this.isLoading = true;
    try{
      //pide al servicio los datos del perfil logueado
      const user = await this.userService.getUserProfile(this.userId);
      //asigna los datos recibidos al objeto que se vincula con el formulario
      this.dataProfile.restaurantName = user.restaurantName;
      this.dataProfile.firstName = user.firstName;
      this.dataProfile.lastName = user.lastName;
      this.dataProfile.phoneNumber = user.phoneNumber;
      this.dataProfile.email = user.email
      this.dataProfile.address = user.address || "";
      this.dataProfile.password = "";// por seguridad el campo de contrasña queda vacio
      } catch (error){
        console.error(error);//si hay un error lo manda a login
        this.router.navigate(['/login']);
        } finally{
          this.isLoading = false;
    }
  }

  async saveChanges(form: NgForm){
    if(form.invalid) return;//si el formulario tiene errores se frena el metodo

    this.isLoading = true;
    try{
      //crea una copia de los datos del perfil para preparar el envío al servidor
      const datos: any = { ...this.dataProfile }; 
      if(datos.password == ""){//si esta vacia la contraseña, eliminamos esa propiedad del objeto para 
                              //que el servidor no mantenga la vieja contraseña
        delete datos.password}
    //llama al servicio para actualizar los datos
    await this.userService.userProfileUpdate(this.userId, datos);
     //muestra alerta estilo Bootstrap  
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
    // Lanza una ventana para confirmar la eliminacion de la cuenta
    const result = await this.swalWithBootstrapButtons.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto y perderás tu menú.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar cuenta",
      cancelButtonText: "Cancelar",
      reverseButtons: true
    });
    //si el usuario confirma
    if (result.isConfirmed) {
      try {
        //llama al servicio para borrar el login
        await this.userService.deleteUserProfile(this.userId);
        localStorage.clear();//limipia toda la info de sesion guardada en el localStorage
        //muestra mensaje final
        await this.swalWithBootstrapButtons.fire({
          title: "¡Eliminado!",
          text: "Tu cuenta ha sido borrada.",
          icon: "success"
        });
        //lo manda a login
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