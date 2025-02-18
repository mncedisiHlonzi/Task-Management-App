import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewTasksPageRoutingModule } from './view-tasks-routing.module';

import { ViewTasksPage } from './view-tasks.page';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTasksPageRoutingModule,
    HttpClientModule
  ],
  declarations: [ViewTasksPage]
})
export class ViewTasksPageModule {}
