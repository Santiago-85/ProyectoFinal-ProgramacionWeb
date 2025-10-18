import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth'; 
import { ReservasComponent } from './reservas/reservas';
import { MisReservasComponent } from './mis-reservas/mis-reservas';
import { ReportesComponent } from './reportes/reportes';
import { AuthGuard } from './services/auth-guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent },

  { path: 'reservar', component: ReservasComponent, canActivate: [AuthGuard] },
  { path: 'mis-reservas', component: MisReservasComponent, canActivate: [AuthGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard] },

  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirige la raíz a la página de login
  { path: '**', redirectTo: '/login' }, // Para cualquier ruta no definida, redirige a login
];

