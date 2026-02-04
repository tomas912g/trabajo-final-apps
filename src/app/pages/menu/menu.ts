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
import { CategoriesService } from '../../services/categories';

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
  categoriesService = inject(CategoriesService)

  restaurantId!: number; 
  restaurantName: string = "";//para almacenar el ID numerico, previamente al constructor
  allProducts: Product[] = [];
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
    categoryId: undefined as number | undefined,
    descuento: 0,
    happyHour: false,
  };
  usarNuevaCategoria: boolean = false;
  nombreNuevaCategoria: string = '';


  currentCategoryId: number | undefined  = undefined; 
  currentIsDiscount: boolean = false; 
  currentIsHappyHour: boolean = false;


  categories: any[] = [
    { name: "Todos", categoryId: undefined, isDiscount: false },
    { name: "Promociones", categoryId: undefined, isDiscount: true },
    { name: "Happy Hour", categoryId: undefined, isDiscount: false, isHappyHour: true },
  ];

  ngOnInit(): void {
    this.route.params.subscribe(async params => { 
      const userIdString = params['userId'];
      this.restaurantId = +userIdString 

      
      if(this.restaurantId){
        this.isOwner = this.authService.currentUserId === this.restaurantId;
        await this.loadMenuinitial();
        this.loadRestauranInfo()
      }
    });
    }

    async loadMenuinitial(){
      this.isLoading = true;
      try {
        const data = await this.inProduct.getProductsByRestaurant(this.restaurantId);
      this.allProducts = data; 
      this.menu = data;       
      this.extractCategories(data); 
      } catch (err) {
      console.error("Error cargando menú:", err);
    } finally {
      this.isLoading = false;
    }
  }

  async extractCategories(products: Product[]) {
    const uniqueCategories = new Map<number, string>(); 
  products.forEach(p => {

      if (p.categoryId && p.categoryName) {
        uniqueCategories.set(p.categoryId, p.categoryName);
      }
    });

    uniqueCategories.forEach((name, id) => {
      this.categories.push({
        name: name,
        categoryId: id,
        isDiscount: false
      });
    });
  }

  selectcategory(categoryId: number | undefined , isDiscount: boolean, isHappyHour: boolean = false){
    this.currentCategoryId = categoryId;
    this.currentIsDiscount = isDiscount;
    this.currentIsHappyHour = isHappyHour

    let filtered = this.allProducts;

    if(categoryId !== undefined){
      filtered = filtered.filter(p => p.categoryId === categoryId);
    }

    if (isDiscount) {
      filtered = filtered.filter(p => p.isDiscount || p.isDiscount > 0); 
    }

    if (isHappyHour) {
      filtered = filtered.filter(p => p.isHappyHour === true);
    }

    this.menu = filtered;
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

    async deleteCategory(categoryId: number) {
      if (!this.isOwner) return;
      const confirmar = confirm("¿Estás seguro de que deseas eliminar esta categoría?");
      if (confirmar) {
        try {
          await this.categoriesService.deleteCategory(categoryId)
          console.log('Categoría eliminada:', categoryId);
        } catch (error) {  
          console.error("Error al eliminar la categoría:", error);
          }
      }
    }

    addNewProduct() {
      if (this.isOwner) {
        this.productToEdit = null;
        this.nuevoProducto = { nombre: '', precio: 0, categoryId: undefined, descuento: 0, happyHour:false };
        this.showProductForm = true;
        
    }
  }
  openEditProduct(product: Product) {
    if (this.isOwner) {
      console.log("Editando producto:", product);
      this.productToEdit = product;
      this.nuevoProducto = { 
        nombre: product.name, 
        precio: product.price, 
        categoryId: product.categoryId,
        descuento: product.isDiscount || 0,
        happyHour: product.isHappyHour || false
      };
      this.showProductForm = true;
    }
  }

  async guardarCambios() {
  if (!this.isOwner) return;
  try {
    let finalCategoryId = this.nuevoProducto.categoryId;
    if (this.usarNuevaCategoria && this.nombreNuevaCategoria) {
      const nuevaCat = await this.inProduct.createCategory(
        this.nombreNuevaCategoria,
        this.restaurantId
      );
      finalCategoryId = nuevaCat.id; 
    }

    if (finalCategoryId === undefined) {
      alert("Por favor, selecciona una categoría o crea una nueva.");
      return;
    }

    const datosProducto = {
      name: this.nuevoProducto.nombre,
      price: this.nuevoProducto.precio,
      categoryId: finalCategoryId,
      userId: this.restaurantId,
      isDiscount: this.nuevoProducto.descuento,
      isHappyHour: this.nuevoProducto.happyHour,
    };

    if (this.productToEdit) {
      await this.inProduct.updateProduct(this.productToEdit.id, datosProducto);
      alert("Producto actualizado exitosamente");
    } else { 
      await this.inProduct.createNewProduct(datosProducto);
      alert("Producto creado exitosamente");
    }

    this.showProductForm = false;
    this.productToEdit = null;
    this.usarNuevaCategoria = false;
    this.nombreNuevaCategoria = '';
    this.nuevoProducto = { nombre: '', precio: 0, categoryId: undefined, descuento: 0, happyHour: false };

    await this.loadMenuinitial();

    } catch (error) {
    console.error("detalle del error:", error);
    alert("No se pudo guardar el producto.");
  }
}

  async deleteProduct(productId: number) {
    if (!this.isOwner) return;
    if (confirm("¿Eliminar este producto?")) {
      try {
      console.log("Borrando ID:", productId); 
           
      await this.inProduct.deleteProduct(productId);
      
      await this.loadMenuinitial(); 
      
      alert("Producto eliminado.");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el producto.");
    }
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
