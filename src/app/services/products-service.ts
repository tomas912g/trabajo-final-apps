import { inject, Injectable } from '@angular/core';
import { Product } from '../interfaces/product';
import { AuthService } from './auth-service';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  readonly URL_BASE = "https://w370351.ferozo.com/api";
  authService = inject(AuthService);


  async getProductsByRestaurant(
    userId : number, categoryId? : number, onylDiscount: boolean = false ): Promise<Product[]> {
    let url =`${this.URL_BASE}/users/${userId}/products`;
    const params = new URLSearchParams() 
    if(categoryId){ 
      params.set('categoryId', categoryId.toString());
    }
    if(onylDiscount){ 
      params.set('discounted', 'true');
    }
    const queryString = params.toString();
    if (queryString){ 
      url += `?${queryString}`;
    }
    const res = await fetch(url, {
      method:'GET',
      headers: this.authService.getAuthHeaders(),
    });
    if(!res.ok) throw new Error("Error al obtener los productos");
    return await res.json();
  }

  async createNewProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${this.URL_BASE}/products`, { 
      method: "POST",
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error("Error al crear el producto");
    return await res.json();
  }

  async updateProduct(productId: number, product: Partial<Product>): Promise<void> { 
    const res = await fetch(`${this.URL_BASE}/products/${productId}`, { 
      method: "PUT",
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error("Error al actualizar el producto");
  }

    async deleteProduct(productId: number): Promise<void> { 
    const res = await fetch(`${this.URL_BASE}/products/${productId}`, { 
      method: "DELETE",
      headers: this.authService.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Error al borrar el producto");
  }


  async updateProductDiscount(productId: number, discount: number): Promise<void> { 
    const res = await fetch(`${this.URL_BASE}/products/${productId}/discount`, { 
      method: "PUT",
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify({discount: discount})
    });
    if (!res.ok) throw new Error("Error al modificar el producto");
  }

  async alternateHappyHour(productId: number): Promise<void> { 
    const res = await fetch(`${this.URL_BASE}/products/${productId}/happy-hour`, { 
      method: "PUT",
      headers: this.authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al cambiar estado de Happy Hour al producto");
  }

  async toggleProductFavorite(productId: number): Promise<void> {
    const url = `${this.URL_BASE}/products/${productId}/favorite`;
    const headers = this.authService.getAuthHeaders();

    const res = await fetch(url, {
        method: "PUT",
        headers: headers,
    });
    if (!res.ok) {
        throw new Error("Error al alternar el estado de favorito del producto.");
    }
    }

}