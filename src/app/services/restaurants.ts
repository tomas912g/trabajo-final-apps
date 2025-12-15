import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Restaurant } from '../interfaces/restaurants';
//servicio que vaya a la API y traiga la lista
@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  http = inject(HttpClient); // -> para hacer peticiones a la web

  readonly URL_BASE = "https://w370351.ferozo.com/api/users"; //obtiene los restaurantes registrados

  getRestaurants(): Observable<Restaurant[]> { 
    return this.http.get<Restaurant[]>(this.URL_BASE);//peticion sin token ya que no es publica
  }
}