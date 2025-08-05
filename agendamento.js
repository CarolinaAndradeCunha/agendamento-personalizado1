// Pega elementos da página
const listaSelecionadosEl = document.getElementById('servicos-selecionados');
const totalPrecoEl = document.getElementById('total-preco');
const totalDuracaoEl = document.getElementById('total-duracao');
const btnAgendar = document.getElementById('btn-agendar');

// Puxa os dados do localStorage
const servicosSelecionados = JSON.parse(localStorage.getItem('servicosSelecionados')) || [];
const totalPreco = Number(localStorage.getItem('totalPreco')) || 0;
const totalDuracao = Number(localStorage.getItem('totalDuracao')) || 0;

// Função para formatar minutos em "HH:mm"
function minutosParaHorario(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Mostrar serviços selecionados
function mostrarServicos() {
  listaSelecionadosEl.innerHTML = '';
  servicosSelecionados.forEach(servico => {
    const li = document.createElement('li');
    li.textContent = `${servico.nome} - R$${servico.preco} (${servico.duracao} min)`;
    listaSelecionadosEl.appendChild(li);
  });
  totalPrecoEl.textContent = totalPreco.toFixed(2);
  totalDuracaoEl.textContent = totalDuracao;
}

// Simula buscar horários disponíveis do backend
async function buscarHorariosDisponiveis(dataISO, duracaoMinutos) {
  const expedienteInicio = 9 * 60;  // 9:00 em minutos
  const expedienteFim = 18 * 60;    // 18:00 em minutos
  const almocoInicio = 12 * 60;     // 12:00
  const almocoFim = 13 * 60 + 30;   // 13:30

  const agendamentos = [
    { inicio: 10 * 60, duracao: 60 },
    { inicio: 14 * 60, duracao: 90 }
  ];

  const interval = 30;
  const horarios = [];

  for (let min = expedienteInicio; min + duracaoMinutos <= expedienteFim; min += interval) {
    if (min < almocoFim && (min + duracaoMinutos) > almocoInicio) {
      continue;
    }

    let conflita = false;
    for (const ag of agendamentos) {
      const fimAg = ag.inicio + ag.duracao;
      const fimProposto = min + duracaoMinutos;

      if ((min >= ag.inicio && min < fimAg) ||
          (fimProposto > ag.inicio && fimProposto <= fimAg) ||
          (min <= ag.inicio && fimProposto >= fimAg)) {
        conflita = true;
        break;
      }
    }
    if (!conflita) horarios.push(minutosParaHorario(min));
  }
  return horarios;
}

// Preenche select com horários disponíveis
async function preencherHorarios() {
  const select = document.getElementById('horario');
  const inputData = document.getElementById('calendario');
  if (!inputData || !select) return;

  if (!inputData.value) {
    select.innerHTML = '<option value="">Escolha uma data primeiro</option>';
    select.disabled = true;
    return;
  }

  const dataEscolhida = inputData.value;
  select.disabled = true;
  select.innerHTML = '<option>Carregando horários...</option>';

  const horarios = await buscarHorariosDisponiveis(dataEscolhida, totalDuracao);

  select.innerHTML = '';
  if (horarios.length === 0) {
    select.innerHTML = '<option value="">Nenhum horário disponível neste dia</option>';
  } else {
    horarios.forEach(horario => {
      const opt = document.createElement('option');
      opt.value = horario;
      opt.textContent = horario;
      select.appendChild(opt);
    });
  }
  select.disabled = false;
}

// Atualização da função de envio para usar a API real com Supabase e validação completa
async function enviarAgendamento() {
  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const email = document.getElementById('email').value.trim();
  const data = document.getElementById('calendario').value;
  const horario = document.getElementById('horario').value;
  const pagamento = document.querySelector('input[name="pagamento"]:checked');

  if (!nome || !telefone || !data || !horario || !pagamento) {
    alert('Preencha todos os campos obrigatórios!');
    return;
  }

  const agendamento = {
    nome,
    telefone,
    email,
    data,
    hora: horario,
    pagamento: pagamento.value,
    servicos: servicosSelecionados,
    totalPreco,
    totalDuracao
  };

  try {
    const response = await fetch('/api/agendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agendamento)
    });

    const resultado = await response.json();

    if (!response.ok) {
      alert(resultado.error || 'Erro ao enviar agendamento.');
      return;
    }

    alert('Agendamento enviado com sucesso!');
    localStorage.clear();
    window.location.href = 'index.html';
  } catch (error) {
    alert('Erro inesperado: ' + error.message);
  }
}

function init() {
  mostrarServicos();

  btnAgendar.disabled = false;

  const inputData = document.getElementById('calendario');
  inputData.addEventListener('change', preencherHorarios);

  btnAgendar.addEventListener('click', (e) => {
    e.preventDefault();
    enviarAgendamento();
  });

  const selectHorario = document.getElementById('horario');
  selectHorario.innerHTML = '<option>Escolha uma data primeiro</option>';
  selectHorario.disabled = true;
}

window.addEventListener('DOMContentLoaded', init);
