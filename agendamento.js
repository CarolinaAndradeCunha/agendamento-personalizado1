// Elementos DOM
const form = document.getElementById("form-agendamento");
const calendarioInput = document.getElementById("calendario");
const horarioSelect = document.getElementById("horario");
const resultado = document.getElementById("resultado");
const mensagemSucesso = document.getElementById("mensagem-sucesso");
const listaServicos = document.getElementById("lista-servicos");
const totalSpan = document.getElementById("total");

// Horários em minutos (desde 00:00)
const horarioInicio = 9 * 60;        // 09:00
const horarioFim = 18 * 60;          // 18:00
const pausaInicio = 12 * 60;         // 12:00
const pausaFim = 13.5 * 60;          // 13:30

// Converte "HH:MM" para minutos do dia
function paraMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

// Converte minutos do dia para "HH:MM"
function paraHora(min) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Carrega serviços do localStorage, exibe e calcula total tempo e preço
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

// Gera opções de horário disponíveis baseado no dia selecionado e duração total
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

  // Aqui você deve buscar os agendamentos reais do dia via Supabase, por enquanto está vazio
  const agendamentos = []; 
  // Estrutura esperada: [{ horario: "09:30", duracao: 40 }, { horario: "11:00", duracao: 60 }]

  // Converte agendamentos para intervalos em minutos para facilitar checagem de conflitos
  const ocupados = agendamentos.map(a => ({
    inicio: paraMinutos(a.horario),
    fim: paraMinutos(a.horario) + (a.duracao || 30)
  }));

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

// Atualiza horários quando muda a data
calendarioInput.addEventListener("change", () => {
  if (calendarioInput.value) gerarHorarios(calendarioInput.value);
});

// Tratamento do envio do formulário
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

  // Aqui você faria verificação de conflito definitiva consultando Supabase, mas por enquanto:
  const conflito = false; 

  if (conflito) {
    alert("Esse horário já foi agendado. Escolha outro.");
    gerarHorarios(data);
    return;
  }

  const novoAgendamento = {
    nome,
    telefone,
    email,
    servicos: servicosSelecionados,
    horario,
    duracao: duracaoTotal,
    total,
    pagamento,
    criadoEm: new Date().toISOString(),
  };

  // TODO: Enviar para Supabase

  console.log("Agendamento a salvar:", novoAgendamento);

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

// Inicializa a lista de horários se data já estiver preenchida ao carregar a página
if (calendarioInput.value) gerarHorarios(calendarioInput.value);

// Fecha a mensagem de sucesso
window.fecharMensagem = function () {
  mensagemSucesso.classList.remove("show");
  location.reload();
};
