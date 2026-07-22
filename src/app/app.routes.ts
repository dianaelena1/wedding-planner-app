import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VendorsComponent } from './pages/vendors/vendors.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { GuestsComponent } from './pages/guests/guests.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { PreparationsComponent } from './pages/preparations/preparations.component';
import { RingsComponent } from './pages/rings/rings.component';
import { AccommodationsComponent } from './pages/accommodations/accommodations.component';
import { SeatingPlannerComponent } from './pages/seating-planner/seating-planner.component';
import { CalendarTimelineComponent } from './pages/calendar-timeline/calendar-timeline.component';
import { ExportBackupComponent } from './pages/export-backup/export-backup.component';
import { WeddingDayComponent } from './pages/wedding-day/wedding-day.component';
import { AlertCenterComponent } from './pages/alert-center/alert-center.component';


export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'calendar', component: CalendarTimelineComponent },
  { path: 'export-backup', component: ExportBackupComponent },
  { path: 'vendors', component: VendorsComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'guests', component: GuestsComponent },
  { path: 'seating', component: SeatingPlannerComponent },
  { path: 'cazari', component: AccommodationsComponent },
  { path: 'pregatiri', component: PreparationsComponent },
  { path: 'verighete', component: RingsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'ziua-nuntii', component: WeddingDayComponent },
  { path: 'alerts', component: AlertCenterComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
