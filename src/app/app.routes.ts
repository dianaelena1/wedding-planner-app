import { Routes } from '@angular/router';

import { VendorsComponent } from './pages/vendors/vendors.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { PreparationsComponent } from './pages/preparations/preparations.component';
import { RingsComponent } from './pages/rings/rings.component';
import { AccommodationsComponent } from './pages/accommodations/accommodations.component';
import { SeatingPlannerComponent } from './pages/seating-planner/seating-planner.component';
import { CalendarTimelineComponent } from './pages/calendar-timeline/calendar-timeline.component';
import { ExportBackupComponent } from './pages/export-backup/export-backup.component';
import { AlertCenterComponent } from './pages/alert-center/alert-center.component';

import { DashboardAccessComponent } from './pages/dashboard/dashboard-access.component';
import { GuestsAccessComponent } from './pages/guests/guests-access.component';
import { WeddingDayAccessComponent } from './pages/wedding-day/wedding-day-access.component';

import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  /*
   * VIEWER + ADMIN
   */
  {
    path: 'dashboard',
    component: DashboardAccessComponent
  },
  {
    path: 'guests',
    component: GuestsAccessComponent
  },
  {
    path: 'ziua-nuntii',
    component: WeddingDayAccessComponent
  },

  /*
   * LEGAL - PUBLIC
   */
  {
    path: 'terms',
    loadComponent: () =>
        import('./pages/legal/terms.component')
            .then(m => m.TermsComponent)
  },
  {
    path: 'privacy',
    loadComponent: () =>
        import('./pages/legal/privacy.component')
            .then(m => m.PrivacyComponent)
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