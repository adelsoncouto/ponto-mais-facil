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
  tableData: Array<Ponto> = [];

  ngOnInit() {
  }

  marcarPonto() {
    let registro: Ponto = this.tableData.length > 0
      ? this.tableData[this.tableData.length - 1]
      : new Ponto();

    if (!registro.entrada) {
      registro.entrada = new Date();
      this.tableData.push(registro);
    } else if (!registro.saida) {
      registro.saida = new Date();
      registro.minutos = this.calcularMinutos(registro.entrada, registro.saida);
    } else {
      registro = new Ponto();
      registro.entrada = new Date();
      this.tableData.push(registro);
    }

  }

  calcularMinutos(dataInicial: Date, dataFinal: Date): number {
    const diffMs = dataFinal.getTime() - dataInicial.getTime();
    const diffMins = Math.floor(diffMs / 60000); // 60000 ms = 1 minute
    return diffMins;
  }



}