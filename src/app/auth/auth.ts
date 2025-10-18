import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth'; 
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {
  isLoginMode = true;
  nombre = '';
  correo = '';
  contrasena = '';
  confirmarContrasena = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.nombre = '';
    this.correo = '';
    this.contrasena = '';
    this.confirmarContrasena = '';
  }

  private validarNombre(nombre: string): boolean {
    const nameRegex = /^[a-zA-Z\sñáéíóúÁÉÍÓÚ]+$/;
    return nameRegex.test(nombre);
  }

  onSubmit() {
    if (!this.correo || !this.contrasena || (!this.isLoginMode && !this.nombre)) {
      this.notificationService.show('Campos Incompletos', 'Por favor, completa todos los campos requeridos.');
      return;
    }

    if (!this.isLoginMode) {
      if (!this.validarNombre(this.nombre.trim())) {
        this.notificationService.show('Nombre Inválido', 'El nombre solo puede contener letras y espacios.');
        return;
      }
      if (this.contrasena !== this.confirmarContrasena) {
        this.notificationService.show('Error de Validación', 'Las contraseñas no coinciden.');
        return;
      }
    }

    if (this.isLoginMode) {
      const credentials = { correo: this.correo, contrasena: this.contrasena };
      this.authService.login(credentials).subscribe({
        next: (response: any) => {
          this.notificationService.show('¡Bienvenido!', 'Inicio de sesión exitoso.');
          this.router.navigate(['/reservar']); 
        },
        error: (err: any) => {
          this.notificationService.show('Error de Inicio de Sesión', err.error.message);
        }
      });
    } else {
      const userData = { nombre: this.nombre.trim(), correo: this.correo, contrasena: this.contrasena };
      this.authService.register(userData).subscribe({
        next: (response: any) => {
          this.notificationService.show('Registro Exitoso', '¡Usuario registrado exitosamente! Ahora puedes iniciar sesión.');
          this.toggleMode();
          this.nombre = '';
          this.correo = '';
          this.contrasena = '';
          this.confirmarContrasena = '';
        },
        error: (err: any) => {
          this.notificationService.show('Error de Registro', err.error.message);
        }
      });
    }
  }
}