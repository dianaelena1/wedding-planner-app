import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VendorsComponent } from './pages/vendors/vendors.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { GuestsComponent } from './pages/guests/guests.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { PreparationsComponent } from './pages/preparations/preparations.component';
import { RingsComponent } from './pages/rings/rings.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'vendors', component: VendorsComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'guests', component: GuestsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
  { path: 'pregatiri', component: PreparationsComponent },
  { path: 'verighete', component: RingsComponent },
];
