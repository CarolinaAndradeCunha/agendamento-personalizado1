// Pega serviços selecionados da página inicial (salvos em localStorage)
const servicosEscolhidos = JSON.parse(localStorage.getItem('servicosSelecionados')) || [];

if (servicosEscolhidos.length === 0) {
  document.body.innerHTML = '<p style="text-align:center; margin-top:2rem;">Nenhum serviço selecionado. Por favor, volte e escolha algum serviço.</p>';
  throw new Error('Nenhum serviço selecionado.');
}

// Define agenda fixa
const agendaFixa = {
  seg: { inicio: "09:00", fim: "18:00", pausa: ["12:00", "13:30"] },
  ter: { inicio: "09:00", fim: "18:00", pausa: ["12:00", "13:30"] },
  qua: { inicio: "09:00", fim: "18:00", pausa: ["12:00", "13:30"] },
  qui: { inicio: "09:00", fim: "18:00", pausa: ["12:00", "13:30"] },
  sex: { inicio: "09:00", fim: "18:00", pausa: ["12:00", "13:30"] },
  sab: { inicio: "09:00", fim: "14:00" }
};

const diasBloqueados = ["2025-08-10", "2025-08-15"];

const calendarioInput = document.getElementById('calendario');
const horarioSelect = document.getElementById('horario');
const listaServicos = document.getElementById('lista-servicos');
const totalSpan = document.getElementById('total');
const form = document.getElementById('form-agendamento');
const resultado = document.getElementById('resultado');

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

function minutos(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function horaFormatada(min) {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function gerarHorarios(dia, tempoTotal) {
  const diaSemana = ['dom','seg','ter','qua','qui','sex','sab'][new Date(dia).getDay()];
  const config = agendaFixa[diaSemana];
  if (!config) return [];

  const inicio = minutos(config.inicio);
  const fim = minutos(config.fim);
  const pausaInicio = config.pausa ? minutos(config.pausa[0]) : null;
  const pausaFim = config.pausa ? minutos(config.pausa[1]) : null;

  const horarios = [];
  for (let t = inicio; t + tempoTotal <= fim; t += 15) {
    const inicioAtual = t;
    const fimAtual = t + tempoTotal;
    if (pausaInicio && fimAtual > pausaInicio && inicioAtual < pausaFim) continue;
    horarios.push(horaFormatada(t));
  }
  return horarios;
}

function calcularDuracaoTotal() {
  return servicosEscolhidos.reduce((acc, s) => acc + (s.duracao || 30), 0); // fallback 30min
}

function atualizarHorarios() {
  const data = calendarioInput.value;
  if (!data || diasBloqueados.includes(data)) {
    horarioSelect.innerHTML = '<option disabled selected>Data indisponível</option>';
    return;
  }
  const tempoTotal = calcularDuracaoTotal();
  const horarios = gerarHorarios(data, tempoTotal);
  horarioSelect.innerHTML = '';
  if (!horarios.length) {
    horarioSelect.innerHTML = '<option disabled selected>Nenhum horário disponível</option>';
  } else {
    horarios.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      horarioSelect.appendChild(opt);
    });
  }
}

calendarioInput.addEventListener('change', atualizarHorarios);

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const email = document.getElementById('email').value.trim();
  const data = calendarioInput.value;
  const horario = horarioSelect.value;
  const pagamentoInput = document.querySelector('input[name="pagamento"]:checked');
  const pagamento = pagamentoInput ? pagamentoInput.value : null;

  if (!pagamento || !data || !horario) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  resultado.innerHTML = `
    <p>Agendamento realizado com sucesso para <strong>${data}</strong> às <strong>${horario}</strong>.</p>
    <p>Nome: ${nome}</p>
    <p>Telefone: ${telefone}</p>
    <p>Email: ${email || 'Não informado'}</p>
    <p>Forma de pagamento: ${pagamento}</p>
  `;

  form.reset();
  atualizarHorarios();
  localStorage.removeItem('servicosSelecionados');
});

document.addEventListener('DOMContentLoaded', () => {
  atualizarListaServicos();
  atualizarHorarios();
});
