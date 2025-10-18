import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';
import { Router } from '@angular/router';
import { NotificationService } from './services/notification';

// Declara la variable global de bootstrap
declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, AfterViewInit {
  title = 'ProyectoFinal';

  // 2. Añade propiedades para controlar el modal
  modalNotificacion: any;
  modalTitle = '';
  modalBody = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService, // 3. Inyecta el servicio
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 4. Suscríbete para "escuchar" las peticiones de notificación
    this.notificationService.notification$.subscribe(notification => {
      this.modalTitle = notification.title;
      this.modalBody = notification.body;
      this.cdr.detectChanges(); // Asegura que el texto se actualice en el HTML
      this.modalNotificacion.show(); // Muestra el modal
    });
  }

  ngAfterViewInit(): void {
    // Inicializa el objeto del modal después de que la vista se haya cargado
    const modalElement = document.getElementById('globalNotificacionModal');
    if (modalElement) {
      this.modalNotificacion = new bootstrap.Modal(modalElement);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}