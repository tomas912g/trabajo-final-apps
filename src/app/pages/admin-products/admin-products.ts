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
  productsService = inject(ProductsService);
  authService = inject(AuthService);
  myProduct: Product[] = [];
  isloading = true;

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(){
    this.isloading = true;
    try { const userId = this.authService.currentUserId;
      if(userId){
        this.myProduct = await this.productsService.getProductsByRestaurant(userId);
      } else { console.error("No se pudo obtener el ID de usuario");}
    } 
    catch (error) {
      console.error(error);
    } finally {
      this.isloading = false;
    }
  }

  async borrarProducto(id:number){
    if(!confirm("¿Seguro quiere eliminar este producto?")) return;
    try {await this.productsService.deleteProduct(id);
      this.myProduct = this.myProduct.filter(product => product.id !== id);
    } catch(e){
    alert ("Error al borrar")
    }
  }

  async cambiarHappyHour(product:Product){
    try {await this.productsService.alternateHappyHour(product.id);
      product.isHappyHour = !product.isHappyHour;
  } catch(e){
    alert ("No se pudo cambiar el estado de Happy Hour")
    }
  }
    
  async cambiarDescuento(id:number, porcentajeDescuento:string){
    const newDiscount = Number(porcentajeDescuento)
    if (newDiscount < 0 || newDiscount > 100) {
      alert('El descuento debe ser entre 0 y 100');
      return;
    }
    try { 
      await this.productsService.updateProductDiscount(id, newDiscount);
      alert("Descuento actualizado");
    } catch(e){
      alert ("No se pudo actualizar el descuento")
    }
  }

  async onToggleFavorite(product: Product) {
  try {
    await this.productsService.toggleProductFavorite(product.id);//llama al servicio
    product.isFavorite = !product.isFavorite;//actualizar el estado para mostrar el cambio inmediatamente
    } catch (error) {
    console.error(error);
    }
  }

}
