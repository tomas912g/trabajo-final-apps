import { Component, input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { CategoriesService } from '../../services/categories';
import { Category, CategoryId } from '../../interfaces/category';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesFormComponent implements OnInit {
  private categoriesService = inject(CategoriesService); // injectamos dependencia
  categoryIdToEdit = input<number | null>(null); // usamos la funcion input en vez del @Input(), lo que hace que la variable sea reactiva. puede recibir un numero o null

  categoryData: Category = { // Hacemos el modelo de formulario que se conecta con los inputs a traves de NGModel
    name: '',
    description: ''
  };
  isEditMode = false; // lo usamos para saber en que modo estamos

  async ngOnInit(): Promise<void> {
    const id = this.categoryIdToEdit(); // leemos el valor del signal ejecutandolo como funcion para saber el modo en el que estamos
    if (id) { // si hay id
    this.isEditMode = true; // estamos en modo edicion
    try { 
      const data = await this.categoriesService.getCategoryById(id); // pedimos al backend los datos de la categoria que estamos editando para mostrarlos en los input

      this.categoryData = { // Rellenamos los datos del modelo de formulario
        name: data.name,
        description: data.description
      };
    } catch (error) { // manejamos error en caso de que haya
      console.error('Error al cargar categoría:', error);
    }
  }
}  

  async onSubmit() { // envio del forulario
    try {
      const id = this.categoryIdToEdit();
      if (this.isEditMode && id !== null) { //(PUT)
        // actualiza categoria, usamos el id para saber cual modificar y mandamos los nuevos datos
        await this.categoriesService.updateCategory(id, this.categoryData); 
        alert('Categoria actualizada'); // damos un feedback simple
      } else { // (POST)
        //crea categoria si no hay un id ya creado para la que estamos buscando
        await this.categoriesService.createCategory(this.categoryData);
        alert('Categoria creada'); // respuesta simple
      }
      } catch (error) { // maneja erro
      alert('Error al guardar la categoría.');
    }
  }
}

