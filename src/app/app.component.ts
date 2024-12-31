import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Ponto } from './ponto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Hora } from './hora';
import { Tarefa } from './tarefa';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, CommonModule, FormsModule] // Add FormsModule here
})
export class AppComponent implements OnInit {
  currentTime: string = '';
  currentDate: string = '';
  pontos: Array<Ponto> = [];
  totalMinutos: number = 0;
  pontosVinculados: Array<Hora> = [];
  totalMinutosVinculados: number = 0;
  tarefaSelecionada: Tarefa = { descricao: '', concluida: false, emExecucao: false, historico: [], minutos: 0 };
  novoPonto: Ponto = new Ponto();
  mostrarCardNovoPonto: boolean = false;

  // Pomodoro properties
  pomodoroTime: number = 25 * 60; // 25 minutes in seconds
  breakTime: number = 5 * 60; // 5 minutes in seconds
  pomodoroInterval: any;
  isPomodoroRunning: boolean = false;
  isBreakTime: boolean = false;
  isBlinking: boolean = false;

  // Tarefas
  tarefas: Array<Tarefa> = [];
  novaTarefa: string = '';

  ngOnInit() {
    const pontos = localStorage.getItem('pontos');
    if (pontos) {
      this.pontos = JSON.parse(pontos);
      this.pontos.forEach(ponto => 
        ponto.minutos = this.calcularMinutos(ponto.entrada, ponto.saida));
      this.calcularTotalMinutos();
    }

    const tarefas = localStorage.getItem('tarefas');
    if (tarefas) {
      this.tarefas = JSON.parse(tarefas);
    }
  }

  marcarPonto(tarefa?: string) {
    let registro: Ponto = this.pontos.length > 0
      ? this.pontos[this.pontos.length - 1]
      : new Ponto();

    if (!registro.entrada) {
      registro.entrada = new Date();
      if (tarefa) {
        registro.tarefa = tarefa;
      }
      this.pontos.push(registro);
    } else if (!registro.saida) {
      registro.saida = new Date();
      registro.minutos = this.calcularMinutos(registro.entrada, registro.saida);
    } else {
      registro = new Ponto();
      registro.entrada = new Date();
      if (tarefa) {
        registro.tarefa = tarefa;
      }
      this.pontos.push(registro);
    }
    this.salvarPontos();
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
    this.salvarPontos();
    this.calcularTotalMinutos();
  }

  calcularTotalMinutos() {
    this.totalMinutos = this.pontos.reduce((total, ponto) => total + (ponto.minutos || 0), 0);
  }

  calcularTotalMinutosVinculados() {
    this.totalMinutosVinculados = this.pontosVinculados.reduce((total, ponto) => total + (ponto.minutos || 0), 0);
  }

  formatarHoras(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${this.padZero(horas)}:${this.padZero(mins)}`;
  }

  // Pomodoro methods
  startPomodoro() {
    if (!this.isPomodoroRunning && !this.isBreakTime) {
      this.isPomodoroRunning = true;
      this.isBlinking = false;
      this.pomodoroInterval = setInterval(() => {
        if (this.pomodoroTime > 0) {
          this.pomodoroTime--;
        } else {
          this.stopPomodoro();
          this.isBlinking = true;
        }
      }, 1000);
    } else if (this.isBreakTime) {
      this.isBreakTime = false;
      this.isBlinking = false;
      this.pomodoroInterval = setInterval(() => {
        if (this.breakTime > 0) {
          this.breakTime--;
        } else {
          this.stopPomodoro();
          this.isBlinking = true;
        }
      }, 1000);
    }
  }

  stopPomodoro() {
    this.isPomodoroRunning = false;
    clearInterval(this.pomodoroInterval);
  }

  resetPomodoro() {
    this.stopPomodoro();
    this.pomodoroTime = 25 * 60; // Reset to 25 minutes
    this.breakTime = 5 * 60; // Reset to 5 minutes
    this.isBlinking = false;
    this.isBreakTime = false;
  }

  formatarTempoPomodoro(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${this.padZero(minutos)}:${this.padZero(segs)}`;
  }

  updateEntrada(index: number, event: any) {
    this.pontos[index].entrada = new Date(event.target.value);
    this.pontos[index].minutos = this.calcularMinutos(this.pontos[index].entrada, this.pontos[index].saida);
    this.salvarPontos();
    this.calcularTotalMinutos();
  }
  
  updateSaida(index: number, event: any) {
    this.pontos[index].saida = new Date(event.target.value);
    this.pontos[index].minutos = this.calcularMinutos(this.pontos[index].entrada, this.pontos[index].saida);
    this.salvarPontos();
    this.calcularTotalMinutos();
  }
  
  updatePontosVinculadosEntrada(index: number, event: any) {
    this.pontosVinculados[index].entrada = new Date(event.target.value);
    this.pontosVinculados[index].minutos = this.calcularMinutos(this.pontosVinculados[index].entrada, this.pontosVinculados[index].saida);
    this.salvarTarefas();
    this.calcularTotalMinutos();
  }
  
  updatePontosVinculadosSaida(index: number, event: any) {
    this.pontosVinculados[index].saida = new Date(event.target.value);
    this.pontosVinculados[index].minutos = this.calcularMinutos(this.pontosVinculados[index].entrada, this.pontosVinculados[index].saida);
    this.salvarTarefas();
    this.calcularTotalMinutos();
  }

  // Métodos para tarefas
  adicionarTarefa() {
    if (this.novaTarefa.trim()) {
      this.tarefas.push({ descricao: this.novaTarefa, concluida: false, emExecucao: false, historico: [], minutos: 0 });
      this.novaTarefa = '';
      this.salvarTarefas();
    }
  }

  removerTarefa(index: number) {
    this.tarefas.splice(index, 1);
    this.salvarTarefas();
  }

  marcarTarefaConcluida(index: number) {
    this.tarefas[index].concluida = !this.tarefas[index].concluida;
    this.salvarTarefas();
  }

  alternarExecucaoTarefa(index: number) {
    this.tarefas[index].emExecucao = !this.tarefas[index].emExecucao;
    this.salvarTarefas();
  }

  removerTarefaAssociada(index: number) {
    this.pontos[index].tarefa = '';
    this.salvarPontos();
  }

  mostrarPontosVinculados(indiceTarefa: number) {
    this.tarefaSelecionada = this.tarefas[indiceTarefa];
    this.pontosVinculados = this.tarefaSelecionada.historico || [];
    this.calcularTotalMinutosVinculados();
  }

  excluirPontoVinculado(index: number) {
    const pontoIndex = this.pontosVinculados.findIndex(ponto => ponto === this.pontosVinculados[index]);
    if (pontoIndex !== -1) {
      this.pontosVinculados.splice(pontoIndex, 1);
      this.pontosVinculados.splice(index, 1);
      this.salvarPontos();
      this.calcularTotalMinutos();
      this.calcularTotalMinutosVinculados();
    }
  }

  abrirCardNovoPonto(tarefa: string) {
    this.novoPonto = new Ponto();
    this.novoPonto.tarefa = tarefa;
    this.mostrarCardNovoPonto = true;
  }

  fecharCardNovoPonto() {
    this.mostrarCardNovoPonto = false;
  }

  adicionarNovoPonto() {
    this.novoPonto.minutos = this.calcularMinutos(this.novoPonto.entrada, this.novoPonto.saida);
    this.pontos.push(this.novoPonto);
    this.novoPonto = new Ponto();
    this.salvarPontos();
    this.calcularTotalMinutos();
    this.fecharCardNovoPonto();
  }

  salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(this.tarefas));
  }

  salvarPontos() {
    localStorage.setItem('pontos', JSON.stringify(this.pontos));
  }

  alternarIcone(tarefa: Tarefa) {
    tarefa.emExecucao = !tarefa.emExecucao;
    this.marcarPonto(tarefa.descricao);
    this.salvarTarefas();
  }

  padZero(num: number): string {
    return `00${num}`.slice(-2);
  }


  marcarPontoTarefa(indiceTarefa: number) {
    let registros: Array<Hora> = this.tarefas[indiceTarefa]?.historico || [];
    let ultimoRegistro: Hora = registros.pop() || { minutos: 0 };

    if (!ultimoRegistro.entrada) {
      ultimoRegistro.entrada = new Date();
    } else if (!ultimoRegistro.saida) {
      ultimoRegistro.saida = new Date();
      ultimoRegistro.minutos = this.calcularMinutos(ultimoRegistro.entrada, ultimoRegistro.saida);
    } else {
      registros.push(ultimoRegistro);
      ultimoRegistro = { entrada: new Date(), minutos: 0 };
    }

    registros.push(ultimoRegistro);
    this.tarefas[indiceTarefa].historico = registros;
    this.salvarTarefas();
    this.mostrarPontosVinculados(indiceTarefa);
    this.calcularTotalMinutos();
    this.calcularTotalMinutosVinculados();
  }

  exibirPlay(indiceTarefa: number, play: boolean) {
    const registros: Array<Hora> = this.tarefas[indiceTarefa]?.historico || [];
    const ultimoRegistro: Hora = registros.slice(-1)[0] || {minutos: 0, saida: new Date()};
    if(play) {
      return !!ultimoRegistro.saida;
    } else {
      return !ultimoRegistro.saida;
    }
  }

  calcularTempoTarefa(indiceTarefa: number): number {
    const registros: Array<Hora> = this.tarefas[indiceTarefa]?.historico || [];
    return registros.reduce((total, registro) => total + (registro.minutos || 0), 0);
  }
}

