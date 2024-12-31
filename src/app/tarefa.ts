import { Hora } from "./hora";

export interface Tarefa {
    descricao: string;
    concluida: boolean;
    emExecucao: boolean;
    historico: Array<Hora>;
    minutos: number;
}