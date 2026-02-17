import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products-service';
import { Product } from '../../interfaces/product';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss',
})
export class AdminProducts implements OnInit{
  //inyeccion de servicios
  productsService = inject(ProductsService);//servicio para realizar operaciones CRUD sobre los productos
  authService = inject(AuthService);// serv. para obtener info del usuario
  myProduct: Product[] = [];//array que guarda la lista de productos del restaurant
  isloading = true;

  ngOnInit(): void {
    this.loadData();//llama a la funcion que descarga los productos del servidor
  }

  async loadData(){
    this.isloading = true;
    try { 
      const userId = this.authService.currentUserId;//obtiene el ID del dueño
      if(userId){
        this.myProduct = await this.productsService.getProductsByRestaurant(userId);// llama al servicio para traer los productos que sean de ese restaurant
      } else { console.error("No se pudo obtener el ID de usuario");}
    } 
    catch (error) {
      console.error(error);
    } finally {
      this.isloading = false;//oculta spinner de carga
    }
  }

  async borrarProducto(id:number){
    if(!confirm("¿Seguro quiere eliminar este producto?")) return;//si cancela frena el metodo
    try {
      await this.productsService.deleteProduct(id);//llama al servicio para eliminar el producto en la base de datos
      this.myProduct = this.myProduct.filter(product => product.id !== id);//crea una nueva lista excluyendo el producto cuyo ID coincide con el borrado
                          //el .filter hace que se elimine sin tener que recargar la pagina                          
    } catch(e){
    alert ("Error al borrar")
    }
  }

  async cambiarHappyHour(product:Product){
    try {
      await this.productsService.alternateHappyHour(product.id);//llama al servidor para cambiar el estado de Happy Hour del producto
      product.isHappyHour = !product.isHappyHour;//cambia el valor localmente
  } catch(e){
    alert ("No se pudo cambiar el estado de Happy Hour")
    }
  }
    
  async cambiarDescuento(id:number, porcentajeDescuento:string){
    const newDiscount = Number(porcentajeDescuento)//convierte el texto recibido a numero para poder funcionar
    if (newDiscount < 0 || newDiscount > 100) {
      alert('El descuento debe ser entre 0 y 100');
      return;//sino cumple con lo del if, se frena el metodo
    }
    try { 
      await this.productsService.updateProductDiscount(id, newDiscount);//llama al servicio para enviar el descuento
      const productoLocal = this.myProduct.find(p => p.id === id);//busca el producto en la lista local para actualizar su valor visualmente
      if (productoLocal) {
        productoLocal.discount = newDiscount;//asigna el descuento al producto
        this.myProduct = [...this.myProduct];//actualiza la referencia del array para que se vea el cambio en la vista
        //los "..." modifican la lista sin cambiar los datos originales
      }
      alert("Descuento actualizado");
    } catch(e){
      alert ("No se pudo actualizar el descuento")
    }
  }
}
