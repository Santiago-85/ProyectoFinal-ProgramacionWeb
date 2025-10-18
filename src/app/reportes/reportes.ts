import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from '../services/reportes';
import { ReservasService } from '../services/reservas'; 

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class ReportesComponent implements OnInit {

  reportesData: any = null;
  isLoading = true;

  // Para el diagrama de asientos
  asientosNegociosAgrupados: { [key: string]: any[] } = {};
  asientosEconomicaAgrupados: { [key: string]: any[] } = {};
  filasNegocios: string[] = ['I', 'G', 'F', 'D', 'C', 'A'];
  filasEconomica: string[] = ['I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];

  constructor(
    private reportesService: ReportesService,
    private reservasService: ReservasService 
  ) {}

  ngOnInit(): void {
    this.reportesService.getReportes().subscribe({
      next: (data) => {
        this.reportesData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar reportes:", err);
        this.isLoading = false;
      }
    });

    this.cargarDiagramaAsientos();
  }

  cargarDiagramaAsientos(): void {
    this.reservasService.getAsientos().subscribe((data: any[]) => {
      this.asientosNegociosAgrupados = this.agruparPorFila(data.filter(a => a.clase === 'Negocios'));
      this.asientosEconomicaAgrupados = this.agruparPorFila(data.filter(a => a.clase === 'Económica'));
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
}