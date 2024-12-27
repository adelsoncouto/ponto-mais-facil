import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Ponto } from './ponto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, CommonModule]
})
export class AppComponent implements OnInit {
  currentTime: string = '';
  currentDate: string = '';
  pontos: Array<Ponto> = [];
  totalMinutos: number = 0;

  ngOnInit() {
    const pontos = localStorage.getItem('pontos');
    if (pontos) {
      this.pontos = JSON.parse(pontos);
      this.pontos.forEach(ponto => 
        ponto.minutos = this.calcularMinutos(ponto.entrada, ponto.saida));
      this.calcularTotalMinutos();
    }
  }

  marcarPonto() {
    let registro: Ponto = this.pontos.length > 0
      ? this.pontos[this.pontos.length - 1]
      : new Ponto();

    if (!registro.entrada) {
      registro.entrada = new Date();
      this.pontos.push(registro);
    } else if (!registro.saida) {
      registro.saida = new Date();
      registro.minutos = this.calcularMinutos(registro.entrada, registro.saida);
    } else {
      registro = new Ponto();
      registro.entrada = new Date();
      this.pontos.push(registro);
    }
    localStorage.setItem('pontos', JSON.stringify(this.pontos));
    this.calcularTotalMinutos();
  }

  calcularMinutos(dataInicial: any, dataFinal: any): number {
    if (!dataInicial || !dataFinal) {
      return 0;
    }

    let entrada = new Date(dataInicial);
    let saida = new Date(dataFinal);
    const diffMs = saida.getTime() - entrada.getTime();
    const diffMins = Math.floor(diffMs / 60000); // 60000 ms = 1 minute
    return diffMins;
  }

  excluirPonto(index: number) {
    this.pontos.splice(index, 1);
    localStorage.setItem('pontos', JSON.stringify(this.pontos));
    this.calcularTotalMinutos();
  }

  calcularTotalMinutos() {
    this.totalMinutos = this.pontos.reduce((total, ponto) => total + (ponto.minutos || 0), 0);
  }

  formatarHoras(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${padZero(horas)}:${padZero(mins)}`;
  }

}

function padZero(num: number): string {
  return `00${num}`.slice(-2);
}