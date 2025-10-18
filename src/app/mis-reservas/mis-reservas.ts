import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../services/auth';
import { ReservasService } from '../services/reservas';


declare var bootstrap: any;

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule], // Añade FormsModule
  templateUrl: './mis-reservas.html',
  styleUrls: ['./mis-reservas.css']
})
export class MisReservasComponent implements OnInit, AfterViewInit {

  descargarXML() {
    const apiUrl = 'http://localhost:3000'; 
    window.open(`${apiUrl}/reservas/xml`, '_blank');
  }

  misReservas: any[] = [];
  isLoading = true;

  // Variables para los modales
  reservaActiva: any = null;
  cuiInput: string = '';
  asientoNuevoInput: string = '';

  modalModificar: any;
  modalCancelar: any;
  modalNotificacion: any;
  modalTitle = '';
  modalBody = '';

  isUploading = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private reservasService: ReservasService
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  ngAfterViewInit(): void {
    this.modalModificar = new bootstrap.Modal(document.getElementById('modificarModal'));
    this.modalCancelar = new bootstrap.Modal(document.getElementById('cancelarModal'));
    this.modalNotificacion = new bootstrap.Modal(document.getElementById('notificacionModal'));
  }

  onCargarXML() {
    const inputEl = this.fileInput.nativeElement;
    if (inputEl.files.length === 0) {
      this.mostrarNotificacion('Sin archivo', 'Por favor, selecciona un archivo XML para cargar.');
      return;
    }

    const file: File = inputEl.files[0];
    this.isUploading = true;

    this.reservasService.uploadXML(file).subscribe({
      next: (res) => {
        this.isUploading = false;
        let resumen = `Proceso completado en ${res.duration} ms.\n\n`;
        resumen += `Asientos cargados con éxito: ${res.exitosos}\n`;
        resumen += `Asientos con errores: ${res.errores}\n\n`;
        if (res.errores > 0) {
          resumen += `Detalle de errores:\n${res.erroresDetallados.join('\n')}`;
        }

        this.mostrarNotificacion('Resumen de Carga', resumen);
        this.cargarReservas(); 
      },
      error: (err) => {
        this.isUploading = false;
        this.mostrarNotificacion('Error de Carga', err.error.message || 'Ocurrió un error al subir el archivo.');
      }
    });
  }

  cargarReservas(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.reservasService.getMisReservas(currentUser.id).subscribe({
        next: (data) => {
          this.misReservas = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar mis reservas:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  // Abre el modal de modificación
  abrirModalModificar(reserva: any) {
    this.reservaActiva = reserva;
    this.cuiInput = '';
    this.asientoNuevoInput = '';
    this.modalModificar.show();
  }

  // Abre el modal de cancelación
  abrirModalCancelar(reserva: any) {
    this.reservaActiva = reserva;
    this.cuiInput = '';
    this.modalCancelar.show();
  }

  // Envía la petición de modificación
  onModificarSubmit() {
    if (this.cuiInput !== this.reservaActiva.cui_pasajero) {
      this.mostrarNotificacion('Error', 'El CUI ingresado no coincide con el de la reserva.');
      return;
    }

    const data = {
      cui_pasajero: this.cuiInput,
      id_asiento_antiguo: this.reservaActiva.id_asiento,
      id_asiento_nuevo: this.asientoNuevoInput
    };

    this.reservasService.modificarReserva(data).subscribe({
      next: (res) => {
        this.modalModificar.hide();
        this.mostrarNotificacion('Éxito', res.message);
        this.cargarReservas(); // Recarga la lista
      },
      error: (err) => this.mostrarNotificacion('Error', err.error.message)
    });
  }

  // Envía la petición de cancelación
  onCancelarSubmit() {
    if (this.cuiInput !== this.reservaActiva.cui_pasajero) {
      this.mostrarNotificacion('Error', 'El CUI ingresado no coincide con el de la reserva.');
      return;
    }

    const data = {
      cui_pasajero: this.cuiInput,
      id_asiento: this.reservaActiva.id_asiento
    };

    this.reservasService.cancelarReserva(data).subscribe({
      next: (res) => {
        this.modalCancelar.hide();
        this.mostrarNotificacion('Éxito', res.message);
        this.cargarReservas(); // Recarga la lista
      },
      error: (err) => this.mostrarNotificacion('Error', err.error.message)
    });
  }

  mostrarNotificacion(title: string, body: string) {
    this.modalTitle = title;
    this.modalBody = body;
    this.modalNotificacion.show();
  }

    // Formatea la fecha para mostrarla de forma más amigable
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-GT', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}