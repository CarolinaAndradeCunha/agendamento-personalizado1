// Import Firebase SDK modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCPWrq-J2UKlfdIWElcfhN7a1IMbEK3y80",
  authDomain: "painel-agendamento.firebaseapp.com",
  databaseURL: "https://painel-agendamento-default-rtdb.firebaseio.com/",
  projectId: "painel-agendamento",
  storageBucket: "painel-agendamento.firebasestorage.app",
  messagingSenderId: "192094406681",
  appId: "1:192094406681:web:46a39fbff85684f5d08288"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Elementos DOM
const form = document.getElementById("form-agendamento");
const calendarioInput = document.getElementById("calendario");
const horarioSelect = document.getElementById("horario");
const resultado = document.getElementById("resultado");
const mensagemSucesso = document.getElementById("mensagem-sucesso");
const listaServicos = document.getElementById("lista-servicos");
const totalSpan = document.getElementById("total");

// Horários
const horarioInicio = 9 * 60;
const horarioFim = 18 * 60;
const pausaInicio = 12 * 60;
const pausaFim = 13.5 * 60;

// Utilitários de hora
function paraMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function paraHora(min) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Carrega serviços do localStorage (temporário)
function carregarServicos() {
  const servicosSelecionados = JSON.parse(localStorage.getItem("servicosSelecionados")) || [];
  listaServicos.innerHTML = "";
  let total = 0;
  let duracaoTotal = 0;

  if (servicosSelecionados.length === 0) {
    listaServicos.innerHTML = "<li>Nenhum serviço selecionado.</li>";
    totalSpan.textContent = "R$ 0,00";
    return { total, duracaoTotal, servicosSelecionados };
  }

  servicosSelecionados.forEach(servico => {
    const li = document.createElement("li");
    li.textContent = `${servico.nome} - R$ ${servico.preco.toFixed(2)}`;
    listaServicos.appendChild(li);
    total += servico.preco;
    duracaoTotal += servico.duracao || 30;
  });

  totalSpan.textContent = `R$ ${total.toFixed(2)}`;
  return { total, duracaoTotal, servicosSelecionados };
}

// Gera horários disponíveis
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

  const snapshot = await get(ref(database, `agendamentos/${data}`));
  const agendamentos = snapshot.exists() ? Object.values(snapshot.val()) : [];

  const ocupados = agendamentos.map(a => ({
    inicio: paraMinutos(a.horario),
    duracao: a.duracao || 30
  }));

  for (let t = horarioInicio; t + duracaoTotal <= horarioFim; t += 15) {
    const fim = t + duracaoTotal;
    if (t < pausaFim && fim > pausaInicio) continue;

    const conflito = ocupados.some(({ inicio, duracao }) => {
      const fimAg = inicio + duracao;
      return t < fimAg && fim > inicio;
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

// Atualiza horários ao mudar a data
calendarioInput.addEventListener("change", () => {
  if (calendarioInput.value) gerarHorarios(calendarioInput.value);
});

// Submissão do formulário
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

  // Verifica conflito
  const snap = await get(ref(database, `agendamentos/${data}`));
  const agendamentos = snap.exists() ? Object.values(snap.val()) : [];

  const conflito = agendamentos.some(a => {
    const inicio = paraMinutos(a.horario);
    const fim = inicio + (a.duracao || 30);
    const agInicio = paraMinutos(horario);
    const agFim = agInicio + duracaoTotal;
    return agInicio < fim && agFim > inicio;
  });

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
    criadoEm: new Date().toISOString()
  };

  try {
    await push(ref(database, `agendamentos/${data}`), novoAgendamento);
  } catch (err) {
    alert("Erro ao salvar o agendamento.");
    console.error(err);
    return;
  }

  // Limpa localStorage
  localStorage.removeItem("servicosSelecionados");

  // Mostra mensagem
  resultado.style.display = "block";
  resultado.innerHTML = `
    <h3>Agendamento Confirmado!</h3>
    <p><strong>Nome:</strong> ${nome}</p>
    <p><strong>Telefone:</strong> ${telefone}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Data:</strong> ${data}</p>
    <p><strong>Horário:</strong> ${horario}</p>
    <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
    <p><strong>Forma de pagamento:</strong> ${pagamento}</p>
  `;

  mensagemSucesso.style.display = "flex";
  form.reset();
  horarioSelect.innerHTML = "";
});

// Inicializa se já tiver data
if (calendarioInput.value) gerarHorarios(calendarioInput.value);

// Fecha a mensagem de sucesso
window.fecharMensagem = function () {
  mensagemSucesso.style.display = "none";
  location.reload();
};
