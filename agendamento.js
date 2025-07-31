document.addEventListener("DOMContentLoaded", () => {
  const listaServicos = document.getElementById("lista-servicos");
  const totalSpan = document.getElementById("total");
  const horarioSelect = document.getElementById("horario");
  const form = document.getElementById("form-agendamento");
  const resultado = document.getElementById("resultado");

  // Simula dados dos serviços selecionados
  const servicosEscolhidos = JSON.parse(localStorage.getItem("servicos")) || [
    { nome: "Sobrancelha", preco: 20 },
    { nome: "Depilação", preco: 35 }
  ];

  let total = 0;
  servicosEscolhidos.forEach(servico => {
    const li = document.createElement("li");
    li.textContent = `${servico.nome} - R$ ${servico.preco.toFixed(2)}`;
    listaServicos.appendChild(li);
    total += servico.preco;
  });

  totalSpan.textContent = `R$ ${total.toFixed(2)}`;

  // Horários disponíveis (exemplo simples)
  const horarios = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30"
  ];

  horarios.forEach(h => {
    const option = document.createElement("option");
    option.value = h;
    option.textContent = h;
    horarioSelect.appendChild(option);
  });

  // Ao enviar o formulário
  form.addEventListener("submit", e => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const data = document.getElementById("calendario").value;
    const horario = document.getElementById("horario").value;
    const pagamento = form.querySelector('input[name="pagamento"]:checked')?.value;

    if (!nome || !telefone || !data || !horario || !pagamento) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

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
  });
});
