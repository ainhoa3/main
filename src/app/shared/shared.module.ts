import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Este módulo ya no es necesario para componentes standalone
// Los componentes standalone se importan directamente donde se necesitan

@NgModule({
  imports: [
    CommonModule
  ],
  exports: []
})
export class SharedModule { }
