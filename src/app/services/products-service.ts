import { inject, Injectable } from '@angular/core';
import { Product } from '../interfaces/product';
import { AuthService } from './auth-service';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  readonly URL_BASE = "https://w370351.ferozo.com/api";
  authService = inject(AuthService);

  async getProductsByRestaurant(// define la funcion recibiendo el id como obligatorio, la cat como opcional y si no se pasa un parametro de discount se toma como false
    userId : number, categoryId? : number, onlyDiscount: boolean = false ): Promise<Product[]> {
    let url =`${this.URL_BASE}/users/${userId}/products`; // define la url principal con let pq mas adelante puede cambiar
    const params = new URLSearchParams() // usamos urlsearchparams para construir los parametros de la url sin que lo tengamo que hacer a mano
    if(categoryId){ // si categoryId tiene valor (estamos buscando una categoria)
      params.set('categoryId', categoryId.toString()); // agrega el parametro (id de la cat) a la lista que debe mostrar
    }
    if(onlyDiscount){ //si onlyDiscount es true
      params.set('discounted', 'true'); // agrega el parametro para que aparezca con descuento
    }
    const queryString = params.toString(); // pedimos a la herramienta que nos de el string final de los parametros formateado
    if (queryString){ // si  la cadena tiene texto (filtros) 
      url += `?${queryString}`; // se la pega a la URL original, el signo de pregunta es obligatorio para usar querystring
    }
    // ejemplo de resultado final de la URL: "https://.../users/5/products?categoryId=5&discounted=true"

    const res = await fetch(url, { // hacemos la peticion al servidor con la URL ya modificada
      method:'GET',
      headers: this.authService.getAuthHeaders(),
    });
    if(!res.ok) throw new Error("Error al obtener los productos");
    return await res.json();
  }

  async createNewProduct(product: Partial<Product>): Promise<Product> { //recibe un parametro product en partial para que pueda pasar sin id y promete devolver un product completo (con id)
    const res = await fetch(`${this.URL_BASE}/products`, { // hace el llamado a la ur y envia metodo y autorizacion
      method: "POST",
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify(product) // convierte el cuerpo del objeto a JSON para enviarlo
    });
    if (!res.ok) throw new Error("Error al crear el producto");
    return await res.json();
  }

  async updateProduct(productId: number, product: Partial<Product>): Promise<void> { // recibe el id del product como obligatorio y la informacion del product en partial para enviar solo lo que haya q actualizar
    const res = await fetch(`${this.URL_BASE}/products/${productId}`, { // llamamos a la url apuntando al id especifico y hacemos la peticion
      method: "PUT",
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify(product) // enviamos los datos en JSON 
    });
    if (!res.ok) throw new Error("Error al actualizar el producto");
    // no hay un return ya que la promesa es devolver void (nada)
  }

    async deleteProduct(productId: number): Promise<void> {  // recibe el id del producto a eliminar 
    const res = await fetch(`${this.URL_BASE}/products/${productId}`, { // llama a la url con el id especifico y envia el metodo
      method: "DELETE",
      headers: this.authService.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Error al borrar el producto");
    // no hay un return ya que la promesa es devolver void (nada)
  }


  async updateProductDiscount(productId: number, discount: number): Promise<void> { // recibe id de producto y numero de descuento (porcentaje)
    const res = await fetch(`${this.URL_BASE}/products/${productId}/discount`, { // lama a la url especificamente en el endpoint especializado (/discount) para avisarle que unicamente queres cambiar el descuento
      method: "PUT", 
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify({discount: discount}) // creamos un pequeño objeto para el descuento para que se vea discount: 14 en el texto a enviar
    });
    if (!res.ok) throw new Error("Error al modificar el producto");
    // no hay un return ya que la promesa es devolver void (nada)
  }


  async createCategory(name: string, userId: number): Promise<any>{ // recibe nombre de la categoria e id del restaurant, promete devolver any (devolvemos lo que responda el backend)
    const url = `${this.URL_BASE}/categories`; // hace la peticion a la url en el endpoint categories
    const res = await fetch(url,{
      method: "POST",
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify({
        name: name,
        userId: userId
      }) // envia los parametros en un objeto JSON para enviarlo 
    });
    if (!res.ok) {
      throw new Error( "Error al intentar crear la categoría")
    }
    return await res.json(); // devuelve un objeto con la nueva categoria y su ID
  }

  async alternateHappyHour(productId: number): Promise<void> { // recibe como parametro el id del producto
    const res = await fetch(`${this.URL_BASE}/products/${productId}/happyhour`, { // hace la peticion especificamente al happyhour del id para alternar solo el estado de eso especificamente
      method: "PUT",
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify({}), // enviamos un body JSON vacio para que el servidor no de error ya que espera un JSON
    });
    if (!res.ok) throw new Error("Error al cambiar estado de Happy Hour al producto");
  }

  async toggleProductFavorite(productId: number): Promise<void> { // funciona igual que la de happpy hour
    const url = `${this.URL_BASE}/products/${productId}/favorite`;
    const res = await fetch(url, {
        method: "PUT",
        headers: this.authService.getAuthHeaders(),
    });
    if (!res.ok) {
        throw new Error("Error al alternar el estado de favorito del producto.");
    }
    }
}