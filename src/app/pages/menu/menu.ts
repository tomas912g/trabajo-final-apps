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
    discount: 0,
    happyHour: false,
  };
  usarNuevaCategoria: boolean = false;
  nombreNuevaCategoria: string = '';


  currentCategoryId: number | undefined  = undefined; 
  currentIsDiscount: boolean = false; 
  currentIsHappyHour: boolean = false;

  //filtros que se ven arriba del menu
  categories: any[] = [
    { name: "Todos", categoryId: undefined, isDiscount: false },
    { name: "Promociones", categoryId: undefined, isDiscount: true },
    { name: "Happy Hour", categoryId: undefined, isDiscount: false, isHappyHour: true },
  ];

  ngOnInit(): void {
    this.route.params.subscribe(async params => { //el suscribe es el que esta pendiente a los cambios en a URL
      const userIdString = params['userId'];//obtiene el ID desde la ruta
      this.restaurantId = +userIdString // cambia el ID a numero

      if(this.restaurantId){
        this.isOwner = this.authService.currentUserId === this.restaurantId;//verifica si el usuario es el dueño
        await this.loadMenuinitial();//muestra la info del restaurant
        this.loadRestauranInfo()
      }
    });
    }

    async loadMenuinitial(){
      this.isLoading = true;
      try {
      const data = await this.inProduct.getProductsByRestaurant(this.restaurantId);//llama al servicio para obtener los productos de este restaurant
      this.allProducts = data;//copia todo el menu
      this.menu = data;//asigna los productos       
      this.extractCategories(data);//analiza los productos para generar la lista de categorías
      } catch (err) {
      console.error("Error cargando menú:", err);
    } finally {
      this.isLoading = false;
    }
  }

  async extractCategories(products: Product[]) {
    this.categories = [ // reinicia la lista para evitar duplicados y define los filtros fijos de la aplicacion
    { name: "Todos", categoryId: undefined, isDiscount: false },
    { name: "Promociones", categoryId: undefined, isDiscount: true },
    { name: "Happy Hour", categoryId: undefined, isDiscount: false, isHappyHour: true },
  ];

    const uniqueCategories = new Map<number, string>();//se asegura de que no haya categorias duplicadas.Crea un mapa para almacenar pares de ID y nombre
    products.forEach(p => {//recorre cada producto para ver su categoria y agregarla al mapa
      if (p.categoryId && p.categoryName) {
        uniqueCategories.set(p.categoryId, p.categoryName);
      }
    });
    //convierte las categorias unicas en objetos con el formato que necesita la interfaz para que se vean en el menu 
    uniqueCategories.forEach((name, id) => {
      this.categories.push({
        name: name,
        categoryId: id,
        isDiscount: false
      });
    });
  }

  selectcategory(categoryId: number | undefined , discount: boolean, isHappyHour: boolean = false){
    this.currentCategoryId = categoryId;
    this.currentIsDiscount = discount;
    this.currentIsHappyHour = isHappyHour

    let filtered = this.allProducts;// muestra la lista completa de productos
    //filtra por categoría específica si el ID no es 'undefined'
    if(categoryId !== undefined){
      filtered = filtered.filter(p => p.categoryId === categoryId);
    }

    if (discount) {//si existe descuento, muestra solo productos con descuento
      filtered = filtered.filter(p => p.discount || p.discount > 0); 
    }

    if (isHappyHour) {//si existe Happy Hour, muestra solo productos con Happy Hour
      filtered = filtered.filter(p => p.isHappyHour === true);
    }

    this.menu = filtered;//ctualiza la vista del menú con el resultado final de todos los filtros aplicados
  }

    addCategory() {
      //solo permite la accion si el usuario es dueño
      if (this.isOwner) {
        this.categoryIdSelected = null; //limpia cualquier categoria seleccionada para registrar una nueva
        this.showCategoryForm = true;// muestra el formulario 
      }
    }

    editCategory(category: any) {
      if (!this.isOwner) return;//si no es dueño, frena el metodo
      this.categoryIdSelected = category.categoryId;//guarda el id de la categoria a editar
      this.showCategoryForm = true;//abre el forma de edicion
    }

    async deleteCategory(categoryId: number) {
      if (!this.isOwner) return;//si no es dueño, frena el metodo
      const confirmar = confirm("¿Estás seguro de que deseas eliminar esta categoría?");
      if (confirmar) {
        try {
          await this.categoriesService.deleteCategory(categoryId)//llama al servicio para eliminar la categoria
          console.log('Categoría eliminada:', categoryId);
          await this.loadMenuinitial();//recarga el menu para actualizar la lista de categorias
          alert("Categoría eliminada con éxito");
        } catch (error) {  
          console.error("Error al eliminar la categoría:", error);
          }
      }
    }

    addNewProduct() {
      if (this.isOwner) {
        this.productToEdit = null;//define que es un nuevo producto y no uno a editar
        this.nuevoProducto = { //Inicializa el objeto del formulario con valores por defecto
          nombre: '', 
          precio: 0, 
          categoryId: undefined, 
          discount: 0, 
          happyHour:false };

        this.showProductForm = true;//abre el modal del formulario en el HTML 
    }
  }

  openEditProduct(product: Product) {
    if (this.isOwner) {
      console.log("Editando producto:", product);
      this.productToEdit = product;//guarda la referencia del producto original que estamos editando
      this.nuevoProducto = {//rellena el formulario con los datos del producto que vamos a editar
        nombre: product.name, 
        precio: product.price, 
        categoryId: product.categoryId,
        discount: product.discount || 0,
        happyHour: product.isHappyHour || false
      };
      this.showProductForm = true;//muestra el formulario con los datos ya cargados
    }
  }

  async guardarCambios() {
  if (!this.isOwner) return;
  try {
    let finalCategoryId = this.nuevoProducto.categoryId;
    if (this.usarNuevaCategoria && this.nombreNuevaCategoria) {//si el usuario decidio crear una categoria nueva en el momento
        const nuevaCat = await this.inProduct.createCategory(
          this.nombreNuevaCategoria,
          this.restaurantId
        );
        finalCategoryId = nuevaCat.id;//asigna el nuevo ID
      }

    if (finalCategoryId === undefined) {//no permite guardar si no hay una categoría definida
      alert("Por favor, selecciona una categoría o crea una nueva.");
      return;
    }
    //prepara el objeto con los datos básicos del producto
    const datosProducto = {
      name: this.nuevoProducto.nombre,
      price: this.nuevoProducto.precio,
      categoryId: finalCategoryId,
      userId: this.restaurantId,
    };

    let idProductoFinalizado : number;
    //verifica si vamos a crear o editar
    if (this.productToEdit) {
      idProductoFinalizado = this.productToEdit.id;//obtenemos el id del producto
      await this.inProduct.updateProduct(idProductoFinalizado, datosProducto);
    } else { 
      //si es nuevo creamos el producto y esperamos a que el servidor nos dé su nuevo ID
      const productoCreado = await this.inProduct.createNewProduct(datosProducto);
      idProductoFinalizado = productoCreado.id;
    }

    const nuevoDescuento = this.nuevoProducto.discount || 0;
    const descuentoAnterior = this.productToEdit?.discount || 0;
    //comparamos el descuento nuevo con el que tenia antes
    if(nuevoDescuento > 0 || nuevoDescuento !== descuentoAnterior) {//si el valor cambio o es positivo, actualizamos el descuento en el servidor
      await this.inProduct.updateProductDiscount(idProductoFinalizado, nuevoDescuento);
      }
    //comparamos el estado de Happy Hour
    const nuevoHappyHour = this.nuevoProducto.happyHour;
    const tieneHappyHour = this.productToEdit?.isHappyHour || false;
    //si el usuario cambió el estado, enviamos la actualización
    if (nuevoHappyHour !== tieneHappyHour) {
      await this.inProduct.alternateHappyHour(idProductoFinalizado);
      }

    alert(this.productToEdit ? "Producto actualizado correctamente" : "Producto creado correctamente");
    //cierra el formulario y limpia todos los campos
    this.showProductForm = false;
    this.productToEdit = null;
    this.usarNuevaCategoria = false;
    this.nombreNuevaCategoria = '';
    this.nuevoProducto = { 
      nombre: '', 
      precio: 0, 
      categoryId: undefined, 
      discount: 0, 
      happyHour: false 
    };
    //carga el menú completo para mostrar los cambios reflejados en la interfaz
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
      //manda la peticion de borrado al servicio de productos     
      await this.inProduct.deleteProduct(productId);
      //recarga el menu para reflejar los cambios
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
        const user = await this.userService.getUserProfile(this.restaurantId);//pide al userService info del perfil del restauante actual
        this.restaurantName = user.restaurantName;//extrae el nombre del restaurant
      } catch (error){
        console.error("Error cargando la info del restaurante:", error);
        this.restaurantName = "Restaurante";
      }
  }

  
  async loadMenu(){
    this.isLoading = true; 
    try {//pide al servidor los productos filtrados por restaurante, categoria y descuento
      let products = await this.inProduct.getProductsByRestaurant(
        this.restaurantId,
        this.currentCategoryId,
        this.currentIsDiscount,
      );
      if (this.currentIsHappyHour) {//si tiene happy Hour, lo filtra localmente
        products = products.filter(p => p.isHappyHour === true);
    }
    //actualiza la lista de productos que se muestra en la pantalla
    this.menu = products;
  } catch (err) {
    console.error("Error:", err);
  } finally {
    this.isLoading = false;
  }
}

  openDetail(product: Product){//guarda el producto seleccionado para mostrar su información detallada
    this.selectedProduct = product;
  }
  closeDetail(){//limpia el producto seleccionado para cerrar la vista detallada
    this.selectedProduct = null;
  }
}
