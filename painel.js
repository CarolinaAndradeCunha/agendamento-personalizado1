// Referência ao container no HTML
const listaAgendamentos = document.getElementById("lista-agendamentos");

// Esta função será usada futuramente com Supabase ou outro backend
async function carregarAgendamentos() {
  // Por enquanto, simulando dados fictícios:
  const dadosSimulados = {
    "2025-08-01": [
      { nome: "Joana", servico: "Corte de cabelo", horario: "10:00" },
      { nome: "Marcos", servico: "Manicure", horario: "14:00" }
    ],
    "2025-08-02": [
      { nome: "Ana", servico: "Massagem", horario: "09:30" }
    ]
  };

  try {
    // Percorre os dias (datas)
    Object.keys(dadosSimulados).forEach((data) => {
      const agendamentosDoDia = dadosSimulados[data];
      agendamentosDoDia.forEach((agendamento) => {
        const item = document.createElement("li");
        item.innerHTML = `
          <strong>${agendamento.nome}</strong> agendou <strong>${agendamento.servico}</strong>
          para <strong>${data}</strong> às <strong>${agendamento.horario}</strong>.
        `;
        listaAgendamentos.appendChild(item);
      });
    });
  } catch (error) {
    console.error("Erro ao carregar agendamentos:", error);
    listaAgendamentos.innerHTML = "<li>Erro ao carregar agendamentos.</li>";
  }
}

// Executa ao iniciar
carregarAgendamentos();
