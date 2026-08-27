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

import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  /*
   * VIEWER + ADMIN
   */
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'guests',
    component: GuestsComponent
  },
  {
    path: 'ziua-nuntii',
    component: WeddingDayComponent
  },

  /*
   * ADMIN ONLY
   */
  {
    path: 'calendar',
    component: CalendarTimelineComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'export-backup',
    component: ExportBackupComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'vendors',
    component: VendorsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'payments',
    component: PaymentsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'documents',
    component: DocumentsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'seating',
    component: SeatingPlannerComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'cazari',
    component: AccommodationsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'pregatiri',
    component: PreparationsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'verighete',
    component: RingsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'alerts',
    component: AlertCenterComponent,
    canActivate: [adminGuard]
  },

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];