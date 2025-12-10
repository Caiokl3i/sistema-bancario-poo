class BancoCentral {
    static transacoes = [];

    static registrar(transacao) {
        if (transacao.valor > 1000) this.transacoes.push(transacao);
    }
}

class Banco {
    constructor(nome) {
        this.nome = nome;
        this.agencias = [];
    }

    criarAgencia(nomeAgencia) {
        const novaAgencia = new Agencia(this.agencias.length + 1, nomeAgencia, this);
        this.agencias.push(novaAgencia);
        return novaAgencia;
    }
}

class Agencia {
    constructor(codigoAgencia, nomeAgencia, banco) {
        this.cod = codigoAgencia;
        this.nome = nomeAgencia;
        this.banco = banco;
        this.contas = [];
    }

    criarConta(cliente, chavePix) {
        const novaConta = new Conta(this.contas.length + 1, cliente, this, chavePix);
        cliente.conta = novaConta;
        this.contas.push(novaConta);
        return novaConta;
    }
}

class Conta {
    constructor(numeroConta, donoConta, agencia, chavePix) {
        this.numero = numeroConta;
        this.dono = donoConta;
        this.agencia = agencia;
        this.saldo = 0;
        this.chavePix = chavePix;
        this.transacoes = [];
    }

    registrar(tipo, valor, destino = "") {
        const transacao = { tipo, valor, dono: this.dono.nome, destino };
        this.transacoes.push(transacao);
        BancoCentral.registrar(transacao);
    }

    depositar(valorDeposito) {
        this.saldo += valorDeposito;
        this.registrar("Depósito", valorDeposito);
    }

    sacar(valorSaque) {
        if (valorSaque > this.saldo) return false;
        this.saldo -= valorSaque;
        this.registrar("Saque", valorSaque);
        return true;
    }

    pix(contaDestino, valorPix) {
        if (valorPix > this.saldo) return false;
        this.saldo -= valorPix;
        contaDestino.saldo += valorPix;
        this.registrar("PIX", valorPix, contaDestino.dono.nome);
        return true;
    }
}

class Cliente {
    constructor(cpf, nome) {
        this.cpf = cpf;
        this.nome = nome;
        this.conta = null;
    }
}


/* ---------------- LÓGICA ---------------- */

const banco = new Banco("Banco POO");
document.getElementById("nome-banco").innerText = banco.nome;

// Criar agências
banco.criarAgencia("Agência Três Lagoas");
banco.criarAgencia("Agência São Paulo");
banco.criarAgencia("Agência Rio de Janeiro");

let clienteAtual;

/* -------- LOGIN -------- */
document.getElementById("cadastro-form").addEventListener("submit", event => {
    event.preventDefault();

    const cpfInput = document.getElementById("cpf").value;
    const nomeInput = document.getElementById("nome-usuario").value;

    for (let character of nomeInput) {
        if (!isNaN(character) && character !== " ") {
            alert("Nome inválido!");

            document.getElementById("cpf").value = "";
            document.getElementById("nome-usuario").value = "";
            return;
        }
    }

    if (isNaN(cpfInput || cpfInput.length !== 11)) {
        alert("CPF inválido!");

        document.getElementById("cpf").value = "";
        document.getElementById("nome-usuario").value = "";
        return;
    }

    clienteAtual = new Cliente(cpfInput, nomeInput);

    document.getElementById("container-cadastro").style.display = "none";
    document.getElementById("container-agencia").style.display = "flex";
});

/* -------- CRIAR CONTA -------- */
document.getElementById("agencias-form").addEventListener("submit", event => {
    event.preventDefault();

    const nomeAgenciaSelecionada = document.getElementById("agencias-select").value;
    const chavePixInput = document.getElementById("chave-pix").value;

    const agenciaEncontrada = banco.agencias.find(agencia => agencia.nome === nomeAgenciaSelecionada);
    agenciaEncontrada.criarConta(clienteAtual, chavePixInput);

    document.getElementById("container-agencia").style.display = "none";
    document.getElementById("container-principal").style.display = "block";

    atualizarConta();
});

/* --------- DEPÓSITO --------- */
document.getElementById("form-deposito").addEventListener("submit", event => {
    event.preventDefault();

    const valorDeposito = Number(document.getElementById("valor-deposito").value);

    if (isNaN(valorDeposito) || valorDeposito <= 0) {
        document.getElementById("resposta-transacao").innerText = "Valor inválido!";
        return;
    }

    clienteAtual.conta.depositar(valorDeposito);
    atualizarConta();

    document.getElementById("valor-deposito").value = "";
});

/* --------- SAQUE --------- */
document.getElementById("form-saque").addEventListener("submit", event => {
    event.preventDefault();

    const valorSaque = Number(document.getElementById("valor-saque").value);

    if (isNaN(valorSaque) || valorSaque <= 0) {
        document.getElementById("resposta-transacao").innerText = "Valor inválido!";
        return;
    }

    if (!clienteAtual.conta.sacar(valorSaque)) {
        document.getElementById("resposta-transacao").innerText = "Saldo insuficiente!";
        return;
    }

    atualizarConta();

    document.getElementById("valor-saque").value = "";
});

/* --------- PIX --------- */
document.getElementById("form-pix").addEventListener("submit", event => {
    event.preventDefault();

    const chaveDestino = document.getElementById("pix-chave").value.trim();
    const valorPix = Number(document.getElementById("pix-valor").value);

    if (isNaN(valorPix) || valorPix <= 0) {
        document.getElementById("resposta-transacao").innerText = "Valor inválido!";
        return;
    }

    let contaDestino = null;

    for (const agencia of banco.agencias) {
        contaDestino = agencia.contas.find(conta => conta.chavePix === chaveDestino);
        if (contaDestino) break;
    }

    if (!contaDestino) {
        document.getElementById("resposta-transacao").innerText = "Chave PIX não encontrada!";
        return;
    }

    if (!clienteAtual.conta.pix(contaDestino, valorPix)) {
        document.getElementById("resposta-transacao").innerText = "Saldo insuficiente!";
        return;
    }

    atualizarConta();
    atualizarContaExemplo();

    document.getElementById("pix-chave").value = "";
    document.getElementById("pix-valor").value = "";
});

/* --------- ATUALIZAR INFORMAÇÕES DA CONTA --------- */
function atualizarConta() {
    const conta = clienteAtual.conta;

    document.getElementById("conta-ativa").innerHTML = `
        Dono: ${conta.dono.nome}<br>
        Conta: ${conta.numero}<br>
        Agência: ${conta.agencia.nome} (cod ${conta.agencia.cod})<br>
        Saldo: R$${conta.saldo}<br>
        PIX: ${conta.chavePix}
    `;

    document.getElementById("resposta-transacao").innerText = "Operação realizada!";
}

/* --------- CONTA DE EXEMPLO (RECEBER PIX) --------- */
const clienteExemplo = new Cliente("000", "Conta Exemplo");
const agenciaExemplo = banco.agencias[0];
agenciaExemplo.criarConta(clienteExemplo, "exemplo123");

/* ------ ATUALIZAR INFORMAÇÕES DA CONTA DE EXEMPLO ------ */
function atualizarContaExemplo() {
    document.getElementById("conta-exemplo-info").innerHTML = `
        Dono: ${clienteExemplo.nome}<br>
        Conta: ${clienteExemplo.conta.numero}<br>
        Agência: ${clienteExemplo.conta.agencia.nome}<br>
        Saldo: R$${clienteExemplo.conta.saldo}<br>
        PIX: ${clienteExemplo.conta.chavePix}
    `;
}

atualizarContaExemplo();