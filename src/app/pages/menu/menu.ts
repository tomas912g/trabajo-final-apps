import { Component, inject, OnInit,} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products-service';
import { Product } from '../../interfaces/product';
import { Spinner } from '../../components/spinner/spinner';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductDetailModal } from '../../components/product-detail-modal/product-detail-modal';

@Component({
  selector: 'app-menu',
  imports: [Spinner, ProductCard, ProductDetailModal, RouterLink],
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

  filterMenu(categoryId: number| undefined, isDiscount: boolean){
    //actualizar estado interno
    this.currentCategoryId = categoryId;
    this.currentIsDiscount = isDiscount;

    //recarga el menu con los nuevos filtros
    this.loadMenu();
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
  
  openModal(product: Product){
    this.selectedProduct = product;
  }
  closeModal(){
    this.selectedProduct = null;
  }
}