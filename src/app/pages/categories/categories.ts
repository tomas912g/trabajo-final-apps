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
  private categoriesService = inject(CategoriesService);
  categoryIdToEdit = input<number | null>(null);

  // tipos de datos del formulario
  categoryData: Category = {
    name: '',
    description: ''
  };
  isEditMode = false;

  ngOnInit(): void {
    if (this.categoryIdToEdit()) { 
    this.isEditMode = true;
      }
  }

  async onSubmit() {
    try {
      if (this.isEditMode && this.categoryIdToEdit !== null) {
        // actualiza categoria
        await this.categoriesService.updateCategory(this.categoryIdToEdit()!, this.categoryData); // llama a categoryIdToEdit() para obtener el valor number
        alert('Categoria actualizada');
      } else {
        //crea categoria
        await this.categoriesService.createCategory(this.categoryData);
        alert('Categoria creada');
      }
      } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar la categoría.');
    }
  }
}

