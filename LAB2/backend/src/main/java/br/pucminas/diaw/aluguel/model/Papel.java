package br.pucminas.diaw.aluguel.model;

/** Perfis do sistema: CLIENTE (usuario individual) e agentes (EMPRESA e BANCO). */
public enum Papel {
    CLIENTE, EMPRESA, BANCO;

    public boolean isAgente() {
        return this != CLIENTE;
    }
}
