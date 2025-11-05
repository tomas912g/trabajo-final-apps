import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../Interface/product';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  readonly URL_BASE = "https://restaurant-api.somee.com/api";
  http = inject(HttpClient) //adjuntar el token automaticaente a todas las peticiones

  getProductsByRestaurant(
    userId : number, categoryId? : number, isDiscount: boolean = false
    ): Promise<Product[]> {

    let res = `${this.URL_BASE}/users/${userId}/products`; //defino la URL

    const params = new URLSearchParams(); // Creo contenedor para clave-valor
    
    //filtros
    if(categoryId){ //solo añadimos los parametros si tienen valor
      params.set('categoryId', categoryId.toString());
    }
    if(isDiscount){
      params.set('discounted', 'true');
    }
    // obtener la cadena de filtros
    const products = params.toString();

    // unir la URL con los filtros
    if (products){
      res += `${products}`;
    }
    const product = this.http.get<Product[]>(res); // realizar peticion con la URL construida

    return lastValueFrom(product) //convertir a promesa para await
  }
}