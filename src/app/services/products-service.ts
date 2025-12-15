import { Injectable } from '@angular/core';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  readonly URL_BASE = "https://restaurant-api.somee.com/api";
  

  async getProductsByRestaurant(
    userId : number, categoryId? : number, onylDiscount: boolean = false ): Promise<Product[]> {
    let res =`${this.URL_BASE}/users/${userId}/products`; 
    const params = new URLSearchParams() // Creo contenedor para clave-valor
    //filtros
    if(categoryId){ //solo añadimos los parametros si tienen valor
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

  }