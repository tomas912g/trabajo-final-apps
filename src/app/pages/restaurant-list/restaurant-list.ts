import { Component, inject, OnInit } from '@angular/core';
import { RestaurantService } from '../../services/restaurants';
import { Observable } from 'rxjs';
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
  restaurants$!: Observable<Restaurant[]>; //variables que guardan la lista que recibimos

  ngOnInit(): void {
    this.restaurants$ = this.restaurantService.getRestaurants();
  }
}