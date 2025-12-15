import { inject, Injectable } from '@angular/core';
import { Product } from '../interfaces/product';
import { AuthService } from './auth-service';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  readonly URL_BASE = "https://restaurant-api.somee.com/api";
  
  authService = inject(AuthService);
  // verifica la existencia de un Token valido
    getAuthHeaders(){
      const token = this.authService.token || localStorage.getItem("token");
    return {
      'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // indca que el cliente tiene permiso para acceder
    };
}

  async getProductsByRestaurant(
    userId : number, categoryId? : number, onylDiscount: boolean = false ): Promise<Product[]> {
    let res =`${this.URL_BASE}/users/${userId}/products`; // URL inicial a la que se agregaran los filtros.
    const params = new URLSearchParams() // Crea una instancia de URLSearchParams
    //filtros
    if(categoryId){ //comprueba que existe el categoyId // si el valor es un numero la condicion es verdadea
      params.set('categoryId', categoryId.toString()); //agrega el par clave-valor al objeto params
    }// se usa .toString() porque los parámetros de consulta HTTP deben ser cadenas de texto.
    
    if(onylDiscount){ //solo entra si se pasa onylDiscount explícitamente como true.
      params.set('discounted', 'true');
    }
    
    //toma los filtros aplicados y los adjunta a la URL base
    const queryString = params.toString();
    if (queryString){ // verifica si se aplico algun filtro
      res += `?${queryString}`;//adjunta los filtros a la URL base
    }
    const ans = await fetch(res);//hace la petición HTTP real a la URL
    if(!ans.ok) throw new Error("Error al obtener los productos");// verifica si la respuesta HTTP es exitosa
    return await ans.json();
  }
                                //el objeto puede contener solo algunas de las propiedades de la interfaz
  async createNewProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${this.URL_BASE}/products`, { // inicio dr la peticion
      method: "POST",
      headers: this.getAuthHeaders(),//llama al metodo para obtener las cabeceras requeridas
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error("Error al crear el producto");// verifica si la respuesta HTTP es exitosa
    return await res.json();
  }

  async updateProduct(productId: number, product: Partial<Product>): Promise<void> { //recibe que prducto editar y el objeto product
    const res = await fetch(`${this.URL_BASE}/products/${productId}`, { // construye la URL para apuntar al recurso específico mediante el id
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error("Error al actualizar el producto");
  }

  async deleteProduct(productId: number): Promise<void> { // solo necesita el id del producto a eliminar
    const res = await fetch(`${this.URL_BASE}/products/${productId}`, { // construye la URL para apuntar al recurso específico mediante el id
      method: "DELETE",
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Error al borrar el producto");
  }

  // actualizar descuentos
  async updateProductDiscount(productId: number, discount: number): Promise<void> { // recibe que producto actualizar y el valor del descuento
    const res = await fetch(`${this.URL_BASE}/products/${productId}/discount`, { //construye la URL apuntando al endpoint específico de descuento
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({discount: discount})
    });
    if (!res.ok) throw new Error("Error al modificar el producto");
  }

  async alternateHappyHour(productId: number): Promise<void> { //solo necesta el productId
    const res = await fetch(`${this.URL_BASE}/products/${productId}/happy-hour`, { //construye la URL apuntando al endpoint específico de Happy Hour
      method: "PUT",
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al cambiar estado de Happy Hour al producto");
  }

  }