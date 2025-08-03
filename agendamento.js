// --- Inicialização Supabase ---
const supabaseUrl = 'https://fvjvxqojsditudefuiee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2anZ4cW9qc2RpdHVkZWZ1aWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjMyNTQsImV4cCI6MjA2OTczOTI1NH0.iMEZeFVt0Sooj5wzH-AKFUXAdHShva5bSFJUSrSphpk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- Função para enviar agendamento ao Supabase ---
async function enviarAgendamento(dados) {
  const { data, error } = await supabase
    .from('agendamentos')
    .insert([dados]);

  if (error) {
    console.error('Erro ao agendar:', error.message);
    alert('Erro ao agendar. Tente novamente.');
    return false;
  } else {
    alert('Agendamento realizado com sucesso!');
    console.log('Agendamento salvo:', data);
    return true;
  }
}

// --- Função auxiliar para converter "HH:MM" em minutos ---
function paraMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

// --- Função auxiliar para converter minutos em "HH:MM" ---
function paraHora(min) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// --- Função para calcular hora_fim a partir da hora_inicio e duração ---
function calcularHoraFim(horaInicioStr, duracaoMinutos) {
  const minutosInicio = paraMinutos(horaInicioStr);
  const minutosFim = minutosInicio + duracaoMinutos;
  return paraHora(minutosFim);
}

// --- Elementos DOM ---
const form = document.getElementById("form-agendamento");
const calendarioInput = document.getElementById("calendario");
const horarioSelect = document.getElementById("horario");
const resultado = document.getElementById("resultado");
const mensagemSucesso = document.getElementById("mensagem-sucesso");
const listaServicos = document.getElementById("lista-servicos");
const totalSpan = document.getElementById("total");

// --- Carrega serviços do localStorage, exibe e calcula total tempo e preço ---
function carregarServicos() {
  const servicosSelecionados = JSON.parse(localStorage.getItem("servicosSelecionados")) || [];
  listaServicos.innerHTML = "";
  let total = 0;
  let duracaoTotal = 0;

  if (servicosSelecionados.length === 0) {
    listaServicos.innerHTML = "<li>Nenhum serviço selecionado.</li>";
    totalSpan.textContent = "0 min";
    return { total, duracaoTotal, servicosSelecionados };
  }

  servicosSelecionados.forEach(servico => {
    const li = document.createElement("li");

    li.dataset.duracao = servico.duracao || 30;
    li.textContent = `${servico.nome} - R$ ${servico.preco.toFixed(2)} (${li.dataset.duracao}min)`;
    listaServicos.appendChild(li);

    total += servico.preco;
    duracaoTotal += parseInt(li.dataset.duracao);
  });

  // Formata o tempo total em "1h40min"
  const horas = Math.floor(duracaoTotal / 60);
  const minutos = duracaoTotal % 60;
  let textoDuracao = "";

  if (horas > 0) textoDuracao += `${horas}h`;
  if (minutos > 0) textoDuracao += `${minutos}min`;
  if (textoDuracao === "") textoDuracao = "0 min";

  totalSpan.textContent = textoDuracao;

  return { total, duracaoTotal, servicosSelecionados };
}

// --- Gera opções de horário disponíveis baseado no dia selecionado e duração total ---
async function gerarHorarios(data) {
  horarioSelect.innerHTML = "";

  const { duracaoTotal, servicosSelecionados } = carregarServicos();
  if (servicosSelecionados.length === 0) {
    horarioSelect.innerHTML = `<option disabled selected>Selecione os serviços primeiro</option>`;
    form.querySelector("input[type='submit']").disabled = true;
    return;
  } else {
    form.querySelector("input[type='submit']").disabled = false;
  }

  // Busca os agendamentos reais do dia via Supabase
  const { data: agendamentos, error } = await supabase
    .from('agendamentos')
    .select('hora_inicio, duracao_total')
    .eq('data', data);

  if (error) {
    console.error('Erro ao buscar agendamentos:', error.message);
    alert('Erro ao buscar horários disponíveis.');
    return;
  }

  // Converte agendamentos para intervalos em minutos para facilitar checagem de conflitos
  const ocupados = agendamentos.map(a => ({
    inicio: paraMinutos(a.hora_inicio),
    fim: paraMinutos(a.hora_inicio) + (a.duracao_total || 30)
  }));

  // Parâmetros de horário disponíveis
  const horarioInicio = 9 * 60;        // 09:00
  const horarioFim = 18 * 60;          // 18:00
  const pausaInicio = 12 * 60;         // 12:00
  const pausaFim = 13.5 * 60;          // 13:30

  // Gera opções em intervalos de 15 minutos entre horarioInicio e horarioFim, respeitando a duração total
  for (let t = horarioInicio; t + duracaoTotal <= horarioFim; t += 15) {
    const fim = t + duracaoTotal;

    // Não permitir agendamento que cruza horário de pausa
    if (t < pausaFim && fim > pausaInicio) continue;

    // Checa conflito com agendamentos existentes
    const conflito = ocupados.some(({ inicio, fim: fimAg }) => {
      return t < fimAg && fim > inicio; // intervalo sobreposto
    });

    if (conflito) continue;

    // Adiciona opção válida
    const option = document.createElement("option");
    option.value = paraHora(t);
    option.textContent = paraHora(t);
    horarioSelect.appendChild(option);
  }

  // Caso não haja horário disponível, avisa
  if (!horarioSelect.options.length) {
    const opt = document.createElement("option");
    opt.disabled = true;
    opt.selected = true;
    opt.textContent = "Nenhum horário disponível";
    horarioSelect.appendChild(opt);
  }
}

// --- Atualiza horários quando muda a data ---
calendarioInput.addEventListener("change", () => {
  if (calendarioInput.value) gerarHorarios(calendarioInput.value);
});

// --- Tratamento do envio do formulário ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = form.nome.value.trim();
  const telefone = form.telefone.value.trim();
  const email = form.email.value.trim();
  const data = calendarioInput.value;
  const horario = horarioSelect.value;
  const pagamento = form.querySelector("input[name='pagamento']:checked")?.value;

  const { total, duracaoTotal, servicosSelecionados } = carregarServicos();

  if (!nome || !telefone || !data || !horario || !pagamento) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  // Verifica conflito definitivo consultando Supabase (pode melhorar depois)

  // Aqui podemos colocar verificação extra se quiser (opcional)
  // Por enquanto, confiamos na geração dos horários

  const novoAgendamento = {
    nome,
    telefone,
    email,
    data,
    hora_inicio: horario,
    hora_fim: calcularHoraFim(horario, duracaoTotal),
    servicos: servicosSelecionados,
    duracao_total: duracaoTotal,
    total_preco: total,
    pagamento,
    criado_em: new Date().toISOString()
  };

  const sucesso = await enviarAgendamento(novoAgendamento);

  if (!sucesso) return;

  // Limpa seleção de serviços armazenada
  localStorage.removeItem("servicosSelecionados");

  // Mostra confirmação na tela
  resultado.style.display = "block";
  resultado.innerHTML = `
    <h3>Agendamento Confirmado!</h3>
    <p><strong>Nome:</strong> ${nome}</p>
    <p><strong>Telefone:</strong> ${telefone}</p>
    <p><strong>Email:</strong> ${email || "-"}</p>
    <p><strong>Data:</strong> ${data}</p>
    <p><strong>Horário:</strong> ${horario}</p>
    <p><strong>Duração:</strong> ${totalSpan.textContent}</p>
    <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
    <p><strong>Forma de pagamento:</strong> ${pagamento}</p>
  `;

  mensagemSucesso.classList.add("show");
  form.reset();
  horarioSelect.innerHTML = "";
});

// --- Inicializa a lista de horários se data já estiver preenchida ao carregar a página ---
if (calendarioInput.value) gerarHorarios(calendarioInput.value);

// --- Fecha a mensagem de sucesso ---
window.fecharMensagem = function () {
  mensagemSucesso.classList.remove("show");
  location.reload();
};
