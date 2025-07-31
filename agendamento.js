document.addEventListener("DOMContentLoaded", () => {
  const listaServicos = document.getElementById("lista-servicos");
  const totalSpan = document.getElementById("total");
  const horarioSelect = document.getElementById("horario");
  const form = document.getElementById("form-agendamento");
  const resultado = document.getElementById("resultado");
  const calendarioInput = document.getElementById("calendario");

  const servicosEscolhidos = JSON.parse(localStorage.getItem("servicos")) || [
    { nome: "Sobrancelha", preco: 20, duracao: 30 },
    { nome: "Depilação", preco: 35, duracao: 60 }
  ];

  let total = 0;
  let duracaoTotal = 0;
  servicosEscolhidos.forEach(servico => {
    const li = document.createElement("li");
    li.textContent = `${servico.nome} - R$ ${servico.preco.toFixed(2)}`;
    listaServicos.appendChild(li);
    total += servico.preco;
    duracaoTotal += servico.duracao || 30;
  });
  totalSpan.textContent = `R$ ${total.toFixed(2)}`;

  // Horário de funcionamento
  const horarioInicio = 9 * 60; // 09:00
  const horarioFim = 18 * 60;   // 18:00
  const pausaInicio = 12 * 60;  // 12:00
  const pausaFim = 13.5 * 60;   // 13:30

  // Armazena agendamentos no localStorage
  const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || {};

  // Converte "HH:MM" para minutos
  function paraMinutos(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  }

  // Converte minutos para "HH:MM"
  function paraHora(min) {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // Gera horários disponíveis para a data escolhida
  function gerarHorarios(data) {
    const ocupados = agendamentos[data] || [];
    horarioSelect.innerHTML = '';

    for (let t = horarioInicio; t + duracaoTotal <= horarioFim; t += 15) {
      const fimAtual = t + duracaoTotal;

      // Verifica se ultrapassa horário de almoço
      const emHorarioDePausa = t < pausaFim && fimAtual > pausaInicio;
      if (emHorarioDePausa) continue;

      // Verifica conflito com agendamentos existentes
      const conflito = ocupados.some(horarioExistente => {
        const inicioExistente = paraMinutos(horarioExistente);
        const fimExistente = inicioExistente + duracaoTotal;
        return (
          (t >= inicioExistente && t < fimExistente) ||
          (fimAtual > inicioExistente && fimAtual <= fimExistente)
        );
      });

      if (conflito) continue;

      const option = document.createElement("option");
      option.value = paraHora(t);
      option.textContent = paraHora(t);
      horarioSelect.appendChild(option);
    }

    if (!horarioSelect.options.length) {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.selected = true;
      opt.textContent = "Nenhum horário disponível";
      horarioSelect.appendChild(opt);
    }
  }

  // Atualiza os horários ao mudar o dia
  calendarioInput.addEventListener("change", () => {
    const data = calendarioInput.value;
    if (data) gerarHorarios(data);
  });

  // Ao enviar o formulário
  form.addEventListener("submit", e => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const data = calendarioInput.value;
    const horario = horarioSelect.value;
    const pagamento = form.querySelector('input[name="pagamento"]:checked')?.value;

    if (!nome || !telefone || !data || !horario || !pagamento) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Salvar horário agendado
    if (!agendamentos[data]) {
      agendamentos[data] = [];
    }

    const jaExiste = agendamentos[data].includes(horario);
    if (jaExiste) {
      alert("Esse horário já foi agendado por outro cliente. Escolha outro.");
      gerarHorarios(data);
      return;
    }

    agendamentos[data].push(horario);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    localStorage.removeItem("servicos");

    resultado.style.display = "block";
    resultado.innerHTML = `
      <h3>Agendamento Confirmado!</h3>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Telefone:</strong> ${telefone}</p>
      <p><strong>Data:</strong> ${data}</p>
      <p><strong>Horário:</strong> ${horario}</p>
      <p><strong>Forma de pagamento:</strong> ${pagamento}</p>
      <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
    `;

    form.reset();
    horarioSelect.innerHTML = "";
  });

  // Gera horários inicialmente, se houver data marcada
  if (calendarioInput.value) gerarHorarios(calendarioInput.value);
});
