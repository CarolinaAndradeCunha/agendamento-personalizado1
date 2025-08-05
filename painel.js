// Elementos principais
const calendarioEl = document.getElementById("calendario");
const dataSelecionadaEl = document.getElementById("data-selecionada");
const listaCompromissosEl = document.getElementById("lista-compromissos");

// Dados simulados de compromissos
const compromissos = {
  "2025-08-05": [
    {
      nome: "Ana Souza",
      servicos: ["Manicure", "Pedicure"],
      duracao: "1h 30min",
      valor: "R$ 80,00",
      pagamento: "Pix"
    },
    {
      nome: "Lucas Lima",
      servicos: ["Corte Masculino"],
      duracao: "30min",
      valor: "R$ 25,00",
      pagamento: "Dinheiro"
    }
  ],
  "2025-08-07": [
    {
      nome: "Carla Mendes",
      servicos: ["Escova", "Maquiagem"],
      duracao: "2h",
      valor: "R$ 150,00",
      pagamento: "Cartão"
    }
  ]
};

// Função para gerar os dias do mês atual (simples)
function gerarCalendario() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const data = new Date(ano, mes, dia);
    const dataFormatada = data.toISOString().split("T")[0];

    const botaoDia = document.createElement("button");
    botaoDia.classList.add("dia");
    botaoDia.textContent = dia;
    botaoDia.dataset.data = dataFormatada;

    botaoDia.addEventListener("click", () => {
      mostrarCompromissos(dataFormatada);
    });

    calendarioEl.appendChild(botaoDia);
  }
}

// Função para exibir compromissos do dia
function mostrarCompromissos(data) {
  dataSelecionadaEl.textContent = new Date(data).toLocaleDateString("pt-BR");
  listaCompromissosEl.innerHTML = "";

  const agendamentos = compromissos[data];

  if (!agendamentos || agendamentos.length === 0) {
    listaCompromissosEl.innerHTML = "<li>Nenhum compromisso neste dia.</li>";
    return;
  }

  agendamentos.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.nome}</strong><br>
      Serviços: ${item.servicos.join(", ")}<br>
      Duração total: ${item.duracao}<br>
      Total a pagar: <strong>${item.valor}</strong><br>
      Pagamento: ${item.pagamento}
    `;
    listaCompromissosEl.appendChild(li);
  });
}

// Iniciar o calendário
gerarCalendario();
