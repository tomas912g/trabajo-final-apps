import { Component, inject, OnInit } from '@angular/core';
import { RestaurantService } from '../../services/restaurants';
import { Restaurant } from '../../interfaces/restaurants';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restaurant-list',
  imports: [RouterLink, CommonModule],
  templateUrl: './restaurant-list.html',
  styleUrl: './restaurant-list.scss',
})
export class RestaurantList implements OnInit{ // usamos onInit para ejecutar el codigo al arrancar
  restaurantService = inject(RestaurantService)
  restaurants: Restaurant[] = []; // creamos un array vacio de restaurants donde guardaremos la lista que llegue del servidor
  isLoading: boolean = true; // cuando funciona o no el spinner, comienza en true

  async ngOnInit() { // esta funcion se ejecuta automaticamente apenas el componente aparece en pantalla
    this.isLoading = true; // mostramos spinner
    try{
    const data = await this.restaurantService.getRestaurants(); // peticion de datos y espera (await) a que el servidor traiga el JSON del backend
    this.restaurants = data; // guardamos los datos recibidos en nuestra variable
      } catch (error){ // si el servidor o internet fallan, mostramos el error en la consola
      console.error(error);
        } finally{ // pase lo que pase frenamos el spinner
          this.isLoading = false;
        }
  }

  async onToggleFavorite(restaurant: Restaurant) {
    const originalStatus = restaurant.isFavorite; // guardamos el estado original del restaurante por si la peticion falla
    restaurant.isFavorite = !restaurant.isFavorite; // hacemos el cambio visual automatico antes de hacer la peticion al servidor para que el cambio sea mas rapido
  try {
    await this.restaurantService.toggleRestaurantFavorite(restaurant.id); // llamamos a la funcion  para hacer el cambio y que el servidor lo confirme

    } catch (error) { // si hay error
      restaurant.isFavorite = originalStatus; // devolvemos el corazon a su estado original (se despinta) para que el usuario sepa que no funciono
      console.error("Error al seleccionar restaurante:", error);
    }
}
}