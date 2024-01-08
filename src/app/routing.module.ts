import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertAddFormComponent } from './alert-add-form/alert-add-form.component';
import { AlertViewComponent } from './alert-view/alert-view.component';
import { RouterModule, Routes } from '@angular/router';
import { AlertListComponent } from './alert-list/alert-list.component';

//Routing for main screen, input form, and villain view, done on bottom half of screen
const appRoutes: Routes = [
  {path: 'alerts', component: AlertListComponent},
  {path: "alert/add", component: AlertAddFormComponent},
  {path: "alert/:id", component: AlertViewComponent},
  {path: "", redirectTo: '/alerts', pathMatch: 'full'}
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule]
})

export class RoutingModule { }
