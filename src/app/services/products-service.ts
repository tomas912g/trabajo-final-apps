import { inject, Injectable } from '@angular/core';
import { Product } from '../interfaces/product';
import { AuthService } from './auth-service';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  readonly URL_BASE = "https://w370351.ferozo.com/api";
  
  authService = inject(AuthService);
    getAuthHeaders(){
      let token = this.authService.token || localStorage.getItem("token");
      if (token && token.includes('"token"')) {
     try {
       const parsed = JSON.parse(token);
       token = parsed.token;
     } catch (e) {
       console.error("Error limpiando el token:", e);
     }
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  };
}
    
  async getProductsByRestaurant(
    userId : number, categoryId? : number, onylDiscount: boolean = false ): Promise<Product[]> {
    let res =`${this.URL_BASE}/users/${userId}/products`;
    const params = new URLSearchParams() 

    if(categoryId){ 
      params.set('categoryId', categoryId.toString());
    }
    
    if(onylDiscount){ 
      params.set('discounted', 'true');
    }

    const queryString = params.toString();
    if (queryString){ 
      res += `?${queryString}`;
    }
    const ans = await fetch(res);
    if(!ans.ok) throw new Error("Error al obtener los productos");
    return await ans.json();
  }

  async createNewProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${this.URL_BASE}/products`, { 
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error("Error al crear el producto");
    return await res.json();
  }

  async updateProduct(productId: number, product: Partial<Product>): Promise<void> { 
    const res = await fetch(`${this.URL_BASE}/products/${productId}`, { 
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error("Error al actualizar el producto");
  }

  async createCategory(name: string, restaurntId:number): Promise<any> {
    const url = `${this.URL_BASE}/categories`;
    const headers = this.getAuthHeaders();
    console.log("Token enviado:", headers['Authorization']);

  const response = await fetch(url, {
    method: "POST",
    headers: headers, 
    body: JSON.stringify({ name: name,
      userId: restaurntId
    })
  });
  if (!response.ok) {
    const errorBody = await response.text(); 
    console.error("Error del servidor:", errorBody);
    throw new Error('Error al crear la categoría');
  }
  return await response.json();
} 

  async deleteProduct(productId: number): Promise<void> { 
    const res = await fetch(`${this.URL_BASE}/products/${productId}`, { 
      method: "DELETE",
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Error al borrar el producto");
  }

  async updateProductDiscount(productId: number, discount: number): Promise<void> { 
    const res = await fetch(`${this.URL_BASE}/products/${productId}/discount`, { 
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({discount: discount})
    });
    if (!res.ok) throw new Error("Error al modificar el producto");
  }

  async alternateHappyHour(productId: number): Promise<void> { 
    const res = await fetch(`${this.URL_BASE}/products/${productId}/happy-hour`, { 
      method: "PUT",
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al cambiar estado de Happy Hour al producto");
  }

  async toggleProductFavorite(productId: number): Promise<void> {
    const url = `${this.URL_BASE}/products/${productId}/favorite`;
    const headers = this.getAuthHeaders();

    const res = await fetch(url, {
        method: "PUT",
        headers: headers,
    });
    if (!res.ok) {
        throw new Error("Error al alternar el estado de favorito del producto.");
    }
    }

}