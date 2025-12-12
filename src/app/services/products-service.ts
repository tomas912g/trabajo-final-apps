import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../interfaces/product';
import { last, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  readonly URL_BASE = "https://restaurant-api.somee.com/api";
  http = inject(HttpClient) //adjuntar el token automaticaente a todas las peticiones

  getProductsByRestaurant(
    userId : number, categoryId? : number, isDiscount: boolean = false
    ): Promise<Product[]> {
    const url =`${this.URL_BASE}/users/${userId}/products`; 
    let params = new HttpParams(); // Creo contenedor para clave-valor
    //filtros
    if(categoryId) params = params.set('categoryId', categoryId.toString()); //solo añadimos los parametros si tienen valor 
    
    if(isDiscount) params = params.set('discounted', 'true');
    return lastValueFrom(this.http.get<Product[]>(url, { params })); //realizar peticion con la URL construida
    }

    createProduct(userId: number, product:Product): Promise<Product> {
      const url=`${this.URL_BASE}/users/${userId}/products`;
      return lastValueFrom(this.http.post<Product>(url, product));
    }

    editProduct(product: Product): Promise<Product> {
      const url=`${this.URL_BASE}/products/${product.id}`;
      return lastValueFrom(this.http.put<Product>(url, product))
    }

    deleteProduct(productId: number): Promise<void>{
      const url=`${this.URL_BASE}/products/${productId}`;
      return lastValueFrom(this.http.delete<void>(url))
    }

    activateHappyHour(productId:number): Promise<void>{
      const url=`${this.URL_BASE}/products/${productId}/HappyHour`;
      return lastValueFrom(this.http.patch<void>(url, {}));
    }

    updateDisscount(productId: number, discount: number): Promise<void>{
      const url =`${this.URL_BASE}/products/${productId}/discount`;
      return lastValueFrom(this.http.patch<void>(url, { discount: discount}));
    }
  }