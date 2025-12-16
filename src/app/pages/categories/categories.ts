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

  async ngOnInit(): Promise<void> {
    const id = this.categoryIdToEdit();
    if (id) { 
    this.isEditMode = true;
    try { 
      const data = await this.categoriesService.getCategoryById(id);

      this.categoryData = {
        name: data.name,
        description: data.description
      };
    } catch (error) {
      console.error('Error al cargar categoría:', error);
    }
  }
}  

  async onSubmit() {
    try {
      const id = this.categoryIdToEdit();
      if (this.isEditMode && id !== null) {
        // actualiza categoria
        await this.categoriesService.updateCategory(id, this.categoryData); 
        alert('Categoria actualizada');
      } else {
        //crea categoria
        await this.categoriesService.createCategory(this.categoryData);
        alert('Categoria creada');
      }
      } catch (error) {
      alert('Error al guardar la categoría.');
    }
  }
}

