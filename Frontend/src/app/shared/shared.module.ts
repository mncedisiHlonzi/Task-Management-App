// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '../post.data.ago';

@NgModule({
  declarations: [DatePipe],
  imports: [CommonModule],
  exports: [DatePipe] // Exporting DatePipe so it can be used in other modules
})
export class SharedModule {}