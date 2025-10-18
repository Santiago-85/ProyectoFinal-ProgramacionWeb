import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservasService } from '../services/reservas';
import { AuthService } from '../services/auth';

declare var bootstrap: any;

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class ReservasComponent implements OnInit, AfterViewInit {
  
  // Propiedades para el mapa de asientos
  asientosNegociosAgrupados: { [key: string]: any[] } = {};
  asientosEconomicaAgrupados: { [key: string]: any[] } = {};
  filasNegocios: string[] = ['I', 'G', 'F', 'D', 'C', 'A'];
  filasEconomica: string[] = ['I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  
  // Propiedades para el estado del formulario y selección
  selectedSeat: any = null;
  passengerName: string = '';
  passengerCui: string = '';
  hasLuggage: boolean = false;
  
  // Propiedades para el flujo de la reserva
  pasoActual = 1;
  cantidadAsientos = 1;
  asientoActualIndex = 0;

  selectionMode: 'manual' | 'random' = 'manual';
  cuisUsadosEnEstaReserva: string[] = [];
  detallesDeReservaActual: any[] = [];
  idsDeReservasActual: number[] = [];

  
  // Propiedades para los modales de Bootstrap
  modalConfirmacion: any;
  modalElegirClase: any;
  modalNotificacion: any;
  modalContinuar: any;
  modalTitle = '';
  modalBody = '';
  
  // Propiedades para la lógica de precios
  private PRECIO_NEGOCIOS = 250.00;
  private PRECIO_ECONOMICA = 150.00;
  private PRECIO_MALETA = 40.00;

  constructor(
    private reservasService: ReservasService, 
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAsientos();
  }

  ngAfterViewInit(): void {
    const confirmacionEl = document.getElementById('confirmacionModal');
    if (confirmacionEl) this.modalConfirmacion = new bootstrap.Modal(confirmacionEl);

    const elegirClaseEl = document.getElementById('elegirClaseModal');
    if (elegirClaseEl) this.modalElegirClase = new bootstrap.Modal(elegirClaseEl);

    const notificacionEl = document.getElementById('notificacionModal');
    if (notificacionEl) this.modalNotificacion = new bootstrap.Modal(notificacionEl);

    const continuarEl = document.getElementById('continuarModal');
    if (continuarEl) this.modalContinuar = new bootstrap.Modal(continuarEl);
  }

  mostrarNotificacion(title: string, body: string) {
    this.modalTitle = title;
    this.modalBody = body;
    this.cdr.detectChanges(); 
    this.modalNotificacion.show();
  }

  cargarAsientos(): void {
    this.reservasService.getAsientos().subscribe({
      next: (data: any[]) => {
        this.asientosNegociosAgrupados = this.agruparPorFila(data.filter(a => a.clase === 'Negocios'));
        this.asientosEconomicaAgrupados = this.agruparPorFila(data.filter(a => a.clase === 'Económica'));
      },
      error: (err: any) => console.error('Error al cargar los asientos:', err)
    });
  }

  private agruparPorFila(asientos: any[]): { [key: string]: any[] } {
    const grupos: { [key: string]: any[] } = {};
    asientos.forEach(asiento => {
      const fila = asiento.id_asiento.charAt(0);
      if (!grupos[fila]) grupos[fila] = [];
      grupos[fila].push(asiento);
    });
    return grupos;
  }

  iniciarProcesoDeReserva() {
    this.cuisUsadosEnEstaReserva = [];
    this.detallesDeReservaActual = [];
    this.idsDeReservasActual = [];
    if (this.cantidadAsientos > 0) {
      this.pasoActual = 2;
      if (this.selectionMode === 'random') {
        this.modalElegirClase.show();
      }
    } else {
      this.mostrarNotificacion('Entrada Inválida', 'Por favor, ingresa un número válido de asientos.');
    }
  }

  selectSeat(asiento: any) {
    if (asiento.estado === 'Ocupado') return;
    this.selectedSeat = asiento;
  }
  
  selectRandomSeat(clase: 'Negocios' | 'Económica') {
    this.modalElegirClase.hide();
    const asientosAgrupados = clase === 'Negocios' ? this.asientosNegociosAgrupados : this.asientosEconomicaAgrupados;
    const asientosDisponibles = Object.values(asientosAgrupados).flat().filter(a => a.estado === 'Disponible');
    
    if (asientosDisponibles.length === 0) {
      this.mostrarNotificacion('Sin disponibilidad', `No hay asientos disponibles en la clase ${clase}.`);
      setTimeout(() => this.modalElegirClase.show(), 500);
      return;
    }

    const randomIndex = Math.floor(Math.random() * asientosDisponibles.length);
    this.selectSeat(asientosDisponibles[randomIndex]);
  }

  private validarNombre(nombre: string): boolean {
    const nameRegex = /^[a-zA-Z\sñáéíóúÁÉÍÓÚ]+$/;
    return nameRegex.test(nombre);
  }


  private municipiosPorDepartamento: { [key: number]: number } = {
    1: 17, // Guatemala
    2: 8,  // El Progreso
    3: 16, // Sacatepéquez
    4: 16, // Chimaltenango
    5: 13, // Escuintla
    6: 14, // Santa Rosa
    7: 19, // Sololá
    8: 8,  // Totonicapán
    9: 24, // Quetzaltenango
    10: 21, // Suchitepéquez
    11: 9,  // Retalhuleu
    12: 30, // San Marcos
    13: 32, // Huehuetenango
    14: 21, // Quiché
    15: 8,  // Baja Verapaz
    16: 17, // Alta Verapaz
    17: 14, // Petén
    18: 5,  // Izabal
    19: 11, // Zacapa
    20: 11, // Chiquimula
    21: 7,  // Jalapa
    22: 17  // Jutiapa
  };

  private validarCUI(cui: string): boolean {
    if (!cui || cui.length !== 13 || !/^\d+$/.test(cui) || cui === '0000000000000') return false;
    const depto = parseInt(cui.substring(9, 11), 10);
    if (depto === 0 || depto > 22) return false;
  const muni = parseInt(cui.substring(11, 13), 10);
  const maxMunicipios = this.municipiosPorDepartamento[depto]; 
  if (!maxMunicipios || muni === 0 || muni > maxMunicipios) {
    return false; 
  }
    return true;
  }

  confirmSeat(event: Event) {
    event.preventDefault();
    if (!this.passengerName || !this.passengerCui) {
      this.mostrarNotificacion('Campos incompletos', 'Por favor, completa el nombre y el CUI del pasajero.');
      return;
    }
    if (!this.validarNombre(this.passengerName.trim())) {
      this.mostrarNotificacion('Nombre Inválido', 'El nombre solo puede contener letras y espacios.');
      return;
    }
    if (!this.validarCUI(this.passengerCui)) {
      this.mostrarNotificacion('CUI Inválido', 'El CUI ingresado no es válido.');
      return;
    }
    if (this.cuisUsadosEnEstaReserva.includes(this.passengerCui)) {
      this.mostrarNotificacion('CUI Duplicado', 'Este CUI ya ha sido asignado a otro asiento en esta misma reserva.');
      return;
    }
    this.modalConfirmacion.show();
  }
  
  enviarReservaAPI() {
    this.modalConfirmacion.hide();
    
    let precioBase = this.selectedSeat.clase === 'Negocios' ? this.PRECIO_NEGOCIOS : this.PRECIO_ECONOMICA;
    if (this.hasLuggage) {
      precioBase += this.PRECIO_MALETA;
    }

    this.detallesDeReservaActual.push({
      id_asiento: this.selectedSeat.id_asiento,
      nombre_pasajero: this.passengerName.trim(),
      cui_pasajero: this.passengerCui,
      lleva_maleta: this.hasLuggage,
      precio_asiento: precioBase
    });
    this.cuisUsadosEnEstaReserva.push(this.passengerCui);
    
    const fechaReserva = new Date().toLocaleString('es-GT');
    const mensajeExito = `Asiento ${this.selectedSeat.id_asiento} guardado.\nFecha: ${fechaReserva}\nPrecio (base): Q${precioBase.toFixed(2)}`;
    

    if (this.asientoActualIndex +1 < this.cantidadAsientos) {
      this.modalBody = mensajeExito;
      this.cdr.detectChanges();
      this.modalContinuar.show();
    } else {
      this.finalizarCompra(); 
    }
  }

  finalizarCompra() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || this.detallesDeReservaActual.length === 0) return;

    const reservaCompletaData = {
      id_usuario: currentUser.id,
      detalles: this.detallesDeReservaActual
    };

    this.reservasService.crearReserva(reservaCompletaData).subscribe({
      next: (response: any) => {
        const descuentoAplicado = response.descuentoAplicado;
        if (descuentoAplicado && !currentUser.es_vip) {
          currentUser.es_vip = true;
          this.authService.saveUser(currentUser);
        }
        
        let resumenFinal = '¡Todas las reservas han sido completadas con éxito!\n\nResumen:\n';
        let totalFinalConDescuento = 0;
        this.detallesDeReservaActual.forEach(detalle => {
          let precioAsientoFinal = detalle.precio_asiento;
          if (descuentoAplicado) {
            precioAsientoFinal *= 0.90;
          }
          resumenFinal += `\n- Pasajero: ${detalle.nombre_pasajero}\n  Asiento: ${detalle.id_asiento}, Precio: Q${precioAsientoFinal.toFixed(2)}`;
          totalFinalConDescuento += precioAsientoFinal;
        });
        resumenFinal += `\n\nTotal de la compra: Q${totalFinalConDescuento.toFixed(2)}`;
        if (descuentoAplicado) {
          resumenFinal += ` (¡Descuento VIP incluido!)`;
        }
        
        this.mostrarNotificacion('Proceso Finalizado', resumenFinal);
        const notificacionEl = document.getElementById('notificacionModal');
        notificacionEl?.addEventListener('hidden.bs.modal', () => {
          this.router.navigate(['/mis-reservas']);
        }, { once: true });
      },
      error: (err: any) => {  }
    });
  }

  procederSiguientePasajero() {
    this.modalContinuar.hide();
    this.asientoActualIndex++;
    
    const asientoActual = this.selectedSeat;
    const asientoEnMapa = this.asientosNegociosAgrupados[asientoActual.id_asiento.charAt(0)]?.find(a => a.id_asiento === asientoActual.id_asiento) || this.asientosEconomicaAgrupados[asientoActual.id_asiento.charAt(0)]?.find(a => a.id_asiento === asientoActual.id_asiento);
    if(asientoEnMapa) asientoEnMapa.estado = 'Ocupado';
    
    this.cancelSelection();
    if (this.selectionMode === 'random') {
      setTimeout(() => this.modalElegirClase.show(), 500);
    }
  }

  detenerProcesoReserva() {
    this.modalContinuar.hide();
    this.finalizarCompra();
  }

  cancelSelection() {
    this.selectedSeat = null;
    this.passengerName = '';
    this.passengerCui = '';
    this.hasLuggage = false;
  }
}

