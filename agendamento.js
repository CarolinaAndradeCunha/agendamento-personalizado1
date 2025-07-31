// Pega serviços selecionados da página inicial (salvos em localStorage)
const servicosEscolhidos = JSON.parse(localStorage.getItem('servicosSelecionados')) || [];

// Se não tiver serviços selecionados, mostra mensagem e impede uso da página
if (servicosEscolhidos.length === 0) {
  document.body.innerHTML = '<p style="text-align:center; margin-top:2rem;">Nenhum serviço selecionado. Por favor, volte e escolha algum serviço.</p>';
  throw new Error('Nenhum serviço selecionado.');
}

// Simulação de horários disponíveis (ajuste conforme necessidade)
const horariosDisponiveis = {
  '2025-08-01': ['09:00', '10:00', '11:00', '13:30', '15:00', '16:00'],
  '2025-08-02': ['09:00', '10:00', '11:00'],
};

// Simulação de agendamentos já feitos para bloquear horários
const agendamentosFeitos = [];

const calendarioInput = document.getElementById('calendario');
const horarioSelect = document.getElementById('horario');
const listaServicos = document.getElementById('lista-servicos');
const totalSpan = document.getElementById('total');
const form = document.getElementById('form-agendamento');
const resultado = document.getElementById('resultado');

// Atualiza lista de serviços e total
function atualizarListaServicos() {
  listaServicos.innerHTML = '';
  let total = 0;
  servicosEscolhidos.forEach(servico => {
    const li = document.createElement('li');
    li.textContent = `${servico.nome} - R$ ${Number(servico.preco).toFixed(2)}`;
    listaServicos.appendChild(li);
    total += Number(servico.preco);
  });
  totalSpan.textContent = `R$ ${total.toFixed(2)}`;
}

// Atualiza horários disponíveis conforme data, bloqueando ocupados
function atualizarHorarios() {
  const dataSelecionada = calendarioInput.value;
  const horarios = horariosDisponiveis[dataSelecionada] || [];

  const ocupados = agendamentosFeitos
    .filter(ag => ag.data === dataSelecionada)
    .map(ag => ag.horario);

  const horariosDisponiveisFiltrados = horarios.filter(h => !ocupados.includes(h));

  horarioSelect.innerHTML = '';
  if (horariosDisponiveisFiltrados.length === 0) {
    const option = document.createElement('option');
    option.textContent = 'Nenhum horário disponível';
    option.disabled = true;
    horarioSelect.appendChild(option);
  } else {
    horariosDisponiveisFiltrados.forEach(horario => {
      const option = document.createElement('option');
      option.value = horario;
      option.textContent = horario;
      horarioSelect.appendChild(option);
    });
  }
}

calendarioInput.addEventListener('change', atualizarHorarios);

document.addEventListener('DOMContentLoaded', () => {
  atualizarListaServicos();
  atualizarHorarios();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const email = document.getElementById('email').value.trim();
  const data = calendarioInput.value;
  const horario = horarioSelect.value;
  const pagamentoInput = document.querySelector('input[name="pagamento"]:checked');
  const pagamento = pagamentoInput ? pagamentoInput.value : null;

  if (!pagamento) {
    alert('Por favor, selecione uma forma de pagamento.');
    return;
  }

  if (!data || !horario || horario === 'Nenhum horário disponível') {
    alert('Por favor, selecione data e horário válidos.');
    return;
  }

  agendamentosFeitos.push({ data, horario });

  resultado.innerHTML = `
    <p>Agendamento realizado com sucesso para <strong>${data}</strong> às <strong>${horario}</strong>.</p>
    <p>Nome: ${nome}</p>
    <p>Telefone: ${telefone}</p>
    <p>Email: ${email || 'Não informado'}</p>
    <p>Forma de pagamento: ${pagamento}</p>
    <p>O pagamento será feito no dia do atendimento. Esperamos você lá!</p>
  `;

  form.reset();
  atualizarHorarios();

  // Limpar serviços selecionados para próximo agendamento
  localStorage.removeItem('servicosSelecionados');
});
