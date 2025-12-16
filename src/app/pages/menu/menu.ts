import { Component, inject, OnInit,} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../services/products-service';
import { Product } from '../../interfaces/product';
import { Spinner } from '../../components/spinner/spinner';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductDetailModal } from '../../components/product-detail-modal/product-detail-modal';
import { UsersService } from '../../services/users-service'; 

@Component({
  selector: 'app-menu',
  imports: [Spinner, ProductCard, ProductDetailModal],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})

export class Menu implements OnInit{
  route = inject(ActivatedRoute) //saber que restaurante debe mostrar el menu. Obtenemos el ID
  inProduct = inject(ProductsService) // toda logica con backend 
  userService = inject(UsersService); // logica de servicio de usuarios

  restaurantId! : number; //para almacenar el ID numerico, previamente al constructor
  restaurantName: string = "";
  menu: Product[]= []; //array de productos
  isLoading : boolean = true; //mostrar spinner de carga
  selectedProduct: Product | null = null; //producto seleccionado para ver detalle
  //variables de Estado para el filtrado
  currentCategoryId: number | undefined = undefined; // Guarda la categoría seleccionada por el usuario
  currentIsDiscount: boolean = false; //Guarda si el usuario ha activado el filtro de ofertas

  categories = [
    {name: "Promociones", categoryId: undefined, isDiscount: true},
    {name: "Happy Hour", categoryId: undefined, isHappyHour: true, isDiscount: false},
    {name: "Entradas", categoryId: 1, isDiscount: false},
    {name: "Plato Principal", categoryId: 2, isDiscount: false},
    {name: "Bebidas", categoryId: 4, isDiscount: false},
    {name: "Vinos", categoryId: 5, isDiscount: false},
    {name: "Postres", categoryId: 6, isDiscount: false},
  ];

  ngOnInit(): void {
    this.route.params.subscribe(async params => { // async para poder usar await dentro
      //obtenemos el id del restaurante al cargar y lo convertimos en numero
      const userIdString = params['userId'];
      this.restaurantId = +userIdString // el + carga el string a numero

      //Tenemos id, cargamos el menu
      if(this.restaurantId){
        this.loadMenu()
        this.loadRestauranInfo()
      }
    });
    }

    async loadRestauranInfo(){
      try{
        const user = await this.userService.getUserProfile(this.restaurantId);
        this.restaurantName = user.restaurantName;
      } catch (error){
        console.error("Error cargando la info del restaurante:", error);
        this.restaurantName = "Restaurante";
      }
  }

  selectCategory(categoryId: number | undefined, isDiscount: boolean){
    this.currentCategoryId = categoryId;
    this.currentIsDiscount = isDiscount;
    this.loadMenu();
  }

  async loadMenu(){
    this.isLoading = true; 
    try {
      const products = await this.inProduct.getProductsByRestaurant(
        this.restaurantId,
        this.currentCategoryId,
        this.currentIsDiscount,
      );

console.log("--> LISTA DE PRODUCTOS:", products);
    if (products.length > 0) {
       console.log("--> PRIMER PRODUCTO (Ejemplo):", products[0]);
    }

      this.menu = products;
    } catch (err) {
      console.error("Error al cargar el menu:", err)
    } finally {
      this.isLoading = false;
    }
  }  
    
  openDetail(product: Product){
    this.selectedProduct = product;
  }
  closeDetail(){
    this.selectedProduct = null;
  }
}