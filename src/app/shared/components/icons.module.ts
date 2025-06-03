import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteIconComponent } from './delete-icon/delete-icon.component';

const COMPONENTS = [
  DeleteIconComponent
];

@NgModule({
  imports: [
    CommonModule,
    ...COMPONENTS
  ],
  exports: COMPONENTS
})
export class IconsModule { }
