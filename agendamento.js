// Recupera os agendamentos do localStorage
  const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

  // Formulário de agendamento
  const form = document.querySelector("#form-agendamento");
  const lista = document.querySelector("#lista-agendamentos");

  // Função para atualizar a lista na interface
  function atualizarLista() {
    lista.innerHTML = "";
    agendamentos.forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = `${item.nome} - ${item.servico} às ${item.horario} (${item.duracao}) - R$${item.preco}`;
      lista.appendChild(li);
    });
  }

  // Função para verificar conflito de horário
  function horarioDisponivel(horario) {
    return !agendamentos.some((item) => item.horario === horario);
  }

  // Evento de envio do formulário
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const servico = form.servico.value.trim();
    const horario = form.horario.value;
    const preco = form.preco.value.trim();
    const duracao = form.duracao.value.trim();

    if (!nome || !servico || !horario || !preco || !duracao) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (!horarioDisponivel(horario)) {
      alert("Este horário já foi agendado. Por favor, escolha outro.");
      return;
    }

    const novoAgendamento = { nome, servico, horario, preco, duracao };
    agendamentos.push(novoAgendamento);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

    atualizarLista();
    form.reset();
    alert("Agendamento feito com sucesso!");
  });

  // Atualiza a lista ao carregar a página
  atualizarLista();
