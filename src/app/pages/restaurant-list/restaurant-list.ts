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
export class RestaurantList implements OnInit{
  restaurantService = inject(RestaurantService)
  restaurants: Restaurant[] = []; //variables que guardan la lista que recibimos
  isLoading: boolean = true;

  async ngOnInit() {
    this.isLoading = true;
    try{
    const data = await this.restaurantService.getRestaurants();
    console.log("Datos recibidos del backend:", data); 
    this.restaurants = data;
      this.restaurants = await this.restaurantService.getRestaurants();
      } catch (error){
      console.error(error);
        } finally{
          this.isLoading = false;
        }
  }

  async onToggleFavorite(restaurant: Restaurant) {
  try {
    await this.restaurantService.toggleRestaurantFavorite(restaurant.id);
    restaurant.isFavorite = !restaurant.isFavorite;

    } catch (error) {
    console.error("Error al seleccionar restaurante:", error);
    }
}
}