import { Component, inject, OnInit,} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../services/products-service';
import { Product } from '../../interfaces/product';
import { Spinner } from '../../components/spinner/spinner';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductDetailModal } from '../../components/product-detail-modal/product-detail-modal';
import { UsersService } from '../../services/users-service';
import { AuthService } from '../../services/auth-service';
import { CategoriesFormComponent } from '../categories/categories';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu',
  imports: [Spinner, ProductCard, ProductDetailModal, CategoriesFormComponent, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})

export class Menu implements OnInit{
  route = inject(ActivatedRoute) //saber que restaurante debe mostrar el menu. Obtenemos el ID
  inProduct = inject(ProductsService) // toda logica con backend 
  userService = inject(UsersService); // logica de servicio de usuarios
  authService = inject(AuthService)

  restaurantId!: number; 
  restaurantName: string = "";//para almacenar el ID numerico, previamente al constructor
  menu: Product[] = [];//array de productos
  isLoading: boolean = true;//mostrar spinner de carga
  isOwner: boolean = false;

  selectedProduct: Product | null = null; //producto seleccionado para ver detalle
  showProductForm: boolean = false;
  productToEdit: Product | null = null;
  showCategoryForm: boolean = false;
  categoryIdSelected: number | null = null;

  nuevoProducto = {
    nombre: '',
    precio: 0,
    categoryId: undefined as number | undefined
  };

  //variables de Estado para el filtrado
  currentCategoryId: number | undefined = undefined; // Guarda la categoría seleccionada por el usuario
  currentIsDiscount: boolean = false; //Guarda si el usuario ha activado el filtro de ofertas
  currentIsHappyHour: boolean = false;


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
        this.isOwner = this.authService.currentUserId === this.restaurantId;
        this.loadMenu()
        this.loadRestauranInfo()
      }
    });
    }

    addCategory() {
      if (this.isOwner) {
        this.categoryIdSelected = null; 
        this.showCategoryForm = true;  
      }
    }

    editCategory(category: any) {
      if (!this.isOwner) return;
      this.categoryIdSelected = category.categoryId; 
      this.showCategoryForm = true;
    }

    async deleteCategory(categoryId: number | undefined) {
      if (!this.isOwner || categoryId === undefined) return;
      const confirmar = confirm("¿Estás seguro de que deseas eliminar esta categoría?");
      if (confirmar) {
        try {
          console.log('Categoría eliminada:', categoryId);
        } catch (error) {  
          console.error("Error al eliminar la categoría:", error);
          }
      }
    }

    addNewProduct() {
      if (this.isOwner) {
        this.productToEdit = null;
        this.nuevoProducto = { nombre: '', precio: 0, categoryId: undefined };
        this.showProductForm = true;
        
    }
  }
  openEditProduct(product: Product) {
    if (this.isOwner) {
      this.productToEdit = product;
      this.nuevoProducto = { 
        nombre: product.name, 
        precio: product.price, 
        categoryId: product.categoryId 
      };
      this.showProductForm = true;
    }
  }

  async guardarCambios() {
  if (!this.isOwner) return;
  try {
    const datosProducto = {
      nombre: this.nuevoProducto.nombre,
      precio: this.nuevoProducto.precio,
      categoryId: this.nuevoProducto.categoryId,
      userId: this.restaurantId 
    };
    if (this.productToEdit) {
      await this.inProduct.updateProduct(this.productToEdit.id, datosProducto);
      alert("Producto actualizado correctamente");
    } else {
      await this.inProduct.createNewProduct(datosProducto);
      alert("Producto creado correctamente");
    }
    this.showProductForm = false;
    this.productToEdit = null;
    await this.loadMenu();
    } catch (error) {
    alert("Hubo un error al guardar los cambios.");
  }
}

  async deleteProduct(productId: number) {
    if (!this.isOwner) return;
    if (confirm("¿Eliminar este producto?")) {
      console.log("Producto a eliminar:", productId);
    }
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

  selectCategory(categoryId: number | undefined, isDiscount: boolean, isHappyHour: boolean = false){
    this.currentCategoryId = categoryId;
    this.currentIsDiscount = isDiscount;
    this.currentIsHappyHour = isHappyHour
    this.loadMenu();
    
  }
  
  async loadMenu(){
    this.isLoading = true; 
    try {
      let products = await this.inProduct.getProductsByRestaurant(
        this.restaurantId,
        this.currentCategoryId,
        this.currentIsDiscount,
      );
      if (this.currentIsHappyHour) {
        products = products.filter(p => p.isHappyHour === true);
    }

    this.menu = products;
  } catch (err) {
    console.error("Error:", err);
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
