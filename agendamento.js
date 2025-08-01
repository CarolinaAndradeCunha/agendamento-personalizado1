<script type="module">
  // Importa do SDK modular Firebase
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
  import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

  // Config do seu Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyCPWrq-J2UKlfdIWElcfhN7a1IMbEK3y80",
    authDomain: "painel-agendamento.firebaseapp.com",
    databaseURL: "https://painel-agendamento-default-rtdb.firebaseio.com/", // <== A URL do Realtime Database aqui!
    projectId: "painel-agendamento",
    storageBucket: "painel-agendamento.firebasestorage.app",
    messagingSenderId: "192094406681",
    appId: "1:192094406681:web:46a39fbff85684f5d08288"
  };

  // Inicializa Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  // Seletores do DOM
  const form = document.getElementById("form-agendamento");
  const horarioSelect = document.getElementById("horario");
  const calendarioInput = document.getElementById("calendario");
  const resultado = document.getElementById("resultado");
  const mensagemSucesso = document.getElementById("mensagem-sucesso");

  // Horários em minutos
  const horarioInicio = 9 * 60;    // 09:00
  const horarioFim = 18 * 60;      // 18:00
  const pausaInicio = 12 * 60;     // 12:00
  const pausaFim = 13.5 * 60;      // 13:30

  // Pega serviços do localStorage
  const servicosEscolhidos = JSON.parse(localStorage.getItem("servicosSelecionados")) || [];
  let duracaoTotal = servicosEscolhidos.reduce((acc, s) => acc + (s.duracao || 30), 0);
  let total = servicosEscolhidos.reduce((acc, s) => acc + (s.preco || 0), 0);

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

  // Gera opções de horários disponíveis para a data
  async function gerarHorarios(data) {
    horarioSelect.innerHTML = "";

    const agendamentosSnap = await get(ref(database, `agendamentos/${data}`));
    const agendamentosData = agendamentosSnap.exists() ? agendamentosSnap.val() : {};

    // Array com horários ocupados: { inicio: minutos, duracao: minutos }
    const ocupados = Object.values(agendamentosData).map(ag => ({
      inicio: paraMinutos(ag.horario),
      duracao: ag.duracao || 30
    }));

    for (let t = horarioInicio; t + duracaoTotal <= horarioFim; t += 15) {
      const fimAtual = t + duracaoTotal;

      // Impede agendar durante o intervalo de almoço
      if (t < pausaFim && fimAtual > pausaInicio) continue;

      // Verifica conflito com horários já ocupados
      const conflito = ocupados.some(({inicio, duracao}) => {
        const fimExistente = inicio + duracao;
        return (t < fimExistente && fimAtual > inicio);
      });

      if (conflito) continue;

      // Adiciona opção válida
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

  // Evento quando muda a data no input calendário
  calendarioInput.addEventListener("change", () => {
    const data = calendarioInput.value;
    if (data) gerarHorarios(data);
  });

  // Envio do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const telefone = form.telefone.value.trim();
    const email = form.email.value.trim();
    const data = calendarioInput.value;
    const horario = horarioSelect.value;
    const pagamento = form.querySelector('input[name="pagamento"]:checked')?.value;

    if (!nome || !telefone || !data || !horario || !pagamento) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Confere no Firebase se o horário está disponível
    const agendamentosSnap = await get(ref(database, `agendamentos/${data}`));
    const agendamentosData = agendamentosSnap.exists() ? agendamentosSnap.val() : {};

    const conflito = Object.values(agendamentosData).some(ag => {
      const inicio = paraMinutos(ag.horario);
      const fim = inicio + (ag.duracao || 30);
      const agInicio = paraMinutos(horario);
      const agFim = agInicio + duracaoTotal;
      return (agInicio < fim && agFim > inicio);
    });

    if (conflito) {
      alert("Esse horário já foi agendado. Escolha outro.");
      gerarHorarios(data);
      return;
    }

    // Cria novo agendamento
    const novoAgendamento = {
      nome,
      telefone,
      email,
      servicos: servicosEscolhidos,
      horario,
      duracao: duracaoTotal,
      total,
      pagamento,
      criadoEm: new Date().toISOString()
    };

    // Salva no Firebase
    await push(ref(database, `agendamentos/${data}`), novoAgendamento);

    // Limpa seleção
    localStorage.removeItem("servicosSelecionados");

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

  // Gera horários se já tiver data preenchida
  if (calendarioInput.value) gerarHorarios(calendarioInput.value);
</script>
