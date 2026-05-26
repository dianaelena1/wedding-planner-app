import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VendorsComponent } from './pages/vendors/vendors.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { GuestsComponent } from './pages/guests/guests.component';
import { TasksComponent } from './pages/tasks/tasks.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'vendors', component: VendorsComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'guests', component: GuestsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
