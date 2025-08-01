// Referência ao container no HTML
const listaAgendamentos = document.getElementById("lista-agendamentos");

// Função para carregar agendamentos (exemplo genérico)
async function carregarAgendamentos() {
  try {
    // Aqui futuramente vamos buscar os dados da Supabase ou outro back-end

    // Exemplo fictício de agendamentos
    const dados = {
      "2025-08-01": [
        { nome: "Joana", servico: "Massagem", horario: "14:00" },
        { nome: "Carlos", servico: "Corte", horario: "16:00" }
      ],
      "2025-08-02": [
        { nome: "Ana", servico: "Manicure", horario: "10:00" }
      ]
    };

    // Percorre os dias (datas)
    Object.keys(dados).forEach((data) => {
      const agendamentosDoDia = dados[data];
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
