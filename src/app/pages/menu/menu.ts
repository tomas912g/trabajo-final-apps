import { Component, inject, OnInit,} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../services/products-service';
import { Product } from '../../interfaces/product';
import { Spinner } from '../../components/spinner/spinner';

@Component({
  selector: 'app-menu',
  imports: [Spinner],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})

export class Menu implements OnInit{
  route = inject(ActivatedRoute) //saber que restaurante debe mostrar el menu. Obtenemos el ID
  inProduct = inject(ProductsService) // toda logica con backend 

  restaurantId! : number; //para almacenar el ID numerico, previamente al constructor
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
    {name: "Postres", categoryId: 3, isDiscount: false},
    {name: "Bebidas", categoryId: 4, isDiscount: false},
    {name: "Vinos", categoryId: 5, isDiscount: false},
    {name: "Postres", categoryId: 6, isDiscount: false},
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      //obtenemos el id del restaurante al cargar y lo convertimos en numero
      const userIdString = params['userId'];
      this.restaurantId = +userIdString // el + carga el string a numero

      //Tenemos id, cargamos el menu
      if(this.restaurantId){
        this.loadMenu()
      }
    });
  }

  selectCategory(categoryId: number | undefined, isDiscount: boolean){
    this.currentCategoryId = categoryId;
    this.currentIsDiscount = isDiscount;
    this.LoadMenu();
  }

  async LoadMenu(){
    this.isLoading = true; 
    try {
      const products = await this.inProduct.getProductsByRestaurant(
        this.restaurantId,
        this.currentCategoryId,
        this.currentIsDiscount,
      );
      this.menu = products;
    } catch (err) {
      console.error("Error al cargar el menu:", err)
    } finally {
      this.isLoading = false;
    }
  }  
  
  async loadMenu(){
    this.isLoading = true;
      try {

        const products = await this.inProduct.getProductsByRestaurant(
          this.restaurantId,
          this.currentCategoryId,
          this.currentIsDiscount
        );
        this.menu = products; 
      }
      catch (err) {
        console.error("Error al cargar el menu: ", err);
      }
      finally{
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