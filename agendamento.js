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
  // Simulação: expediente 9:00-18:00, almoço 12:00-13:30, já agendados mock
  const expedienteInicio = 9 * 60;  // 9:00 em minutos
  const expedienteFim = 18 * 60;    // 18:00 em minutos
  const almocoInicio = 12 * 60;     // 12:00
  const almocoFim = 13 * 60 + 30;   // 13:30

  // Mock de agendamentos já confirmados nesse dia (em minutos)
  // Cada agendamento tem início e duração
  const agendamentos = [
    { inicio: 10 * 60, duracao: 60 }, // 10:00-11:00
    { inicio: 14 * 60, duracao: 90 }  // 14:00-15:30
  ];

  // Gera horários a cada 30 min entre expediente, pulando almoço e conflitos
  const interval = 30; // min
  const horarios = [];

  for (let min = expedienteInicio; min + duracaoMinutos <= expedienteFim; min += interval) {
    // Verifica se está no horário de almoço
    if (min < almocoFim && (min + duracaoMinutos) > almocoInicio) {
      continue;
    }

    // Verifica se conflita com algum agendamento
    let conflita = false;
    for (const ag of agendamentos) {
      const fimAg = ag.inicio + ag.duracao;
      const fimProposto = min + duracaoMinutos;

      // Se início do proposto está dentro de outro agendamento
      if ((min >= ag.inicio && min < fimAg) ||
          // ou o fim do proposto está dentro
          (fimProposto > ag.inicio && fimProposto <= fimAg) ||
          // ou o proposto engloba outro agendamento
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

  // Se não tiver data escolhida, limpa opções
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

// Envio do formulário de agendamento
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
    horario,
    pagamento: pagamento.value,
    servicos: servicosSelecionados,
    totalPreco,
    totalDuracao
  };

  // Simulação POST para backend
  try {
    // Exemplo: você faz fetch para sua API aqui, troque a URL abaixo
    /*
    const response = await fetch('https://seu-backend/api/agendamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agendamento)
    });
    if (!response.ok) throw new Error('Erro no agendamento');
    */

    alert('Agendamento enviado com sucesso!');

    // Limpa localStorage após agendar
    localStorage.removeItem('servicosSelecionados');
    localStorage.removeItem('totalPreco');
    localStorage.removeItem('totalDuracao');

    // Redirecionar ou resetar página
    window.location.href = 'index.html';

  } catch (error) {
    alert('Erro ao enviar agendamento: ' + error.message);
  }
}

// Inicialização da página
function init() {
  mostrarServicos();

  // Só habilita botão agendar depois que preencher tudo na página (exemplo)
  btnAgendar.disabled = false;

  // Preencher horários quando data mudar
  const inputData = document.getElementById('calendario');
  inputData.addEventListener('change', preencherHorarios);

  // Botão enviar agendamento
  btnAgendar.addEventListener('click', (e) => {
    e.preventDefault();
    enviarAgendamento();
  });

  // Inicia select horário desabilitado
  const selectHorario = document.getElementById('horario');
  selectHorario.innerHTML = '<option>Escolha uma data primeiro</option>';
  selectHorario.disabled = true;
}

window.addEventListener('DOMContentLoaded', init);
