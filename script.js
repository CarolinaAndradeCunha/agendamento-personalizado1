// Subserviços por categoria
const subservicos = {
  unha: [
    { nome: "Manicure", preco: 30, duracao: 30 },
    { nome: "Pedicure", preco: 35, duracao: 40 },
    { nome: "Unha em gel", preco: 70, duracao: 90 }
  ],
  cabelo: [
    { nome: "Corte feminino", preco: 50, duracao: 45 },
    { nome: "Escova", preco: 40, duracao: 40 },
    { nome: "Hidratação", preco: 60, duracao: 60 }
  ],
  maquiagem: [
    { nome: "Make básica", preco: 50, duracao: 30 },
    { nome: "Make festa", preco: 80, duracao: 60 }
  ]
};

const categorias = document.querySelectorAll('.servico-btn');
const subservicosSection = document.getElementById('subservicos');
const categoriasSection = document.getElementById('categorias');
const listaSubservicos = document.getElementById('lista-subservicos');
const listaAgendados = document.getElementById('lista-agendados');
const voltarBtn = document.getElementById('voltar-categorias');
const btnAgendar = document.querySelector('.btn-agendar');
const msgErro = document.getElementById('msg-erro');

// Armazena os serviços selecionados
let selecionados = [];

function mostrarSubservicos(categoria) {
  listaSubservicos.innerHTML = '';
  subservicos[categoria].forEach(servico => {
    const btn = document.createElement('button');
    btn.className = 'btn-subservico';
    btn.textContent = `${servico.nome} - R$${servico.preco} (${servico.duracao} min)`;
    btn.addEventListener('click', () => adicionarServico(servico));
    listaSubservicos.appendChild(btn);
  });
  categoriasSection.classList.add('hidden');
  subservicosSection.classList.remove('hidden');
}

function adicionarServico(servico) {
  // Verifica se já foi adicionado
  if (selecionados.find(s => s.nome === servico.nome)) return;

  selecionados.push(servico);
  atualizarLista();
}

function removerServico(nome) {
  selecionados = selecionados.filter(s => s.nome !== nome);
  atualizarLista();
}

function atualizarLista() {
  listaAgendados.innerHTML = '';
  selecionados.forEach(servico => {
    const li = document.createElement('li');
    li.textContent = `${servico.nome} - R$${servico.preco} (${servico.duracao} min)`;
    const btnRemover = document.createElement('button');
    btnRemover.textContent = '✖';
    btnRemover.className = 'btn-remover';
    btnRemover.addEventListener('click', () => removerServico(servico.nome));
    li.appendChild(btnRemover);
    listaAgendados.appendChild(li);
  });
}

function salvarServicosSelecionados() {
  if (selecionados.length === 0) {
    msgErro.textContent = 'Selecione pelo menos um serviço para agendar.';
    return;
  }
  msgErro.textContent = '';

  const totalPreco = selecionados.reduce((acc, cur) => acc + cur.preco, 0);
  const totalDuracao = selecionados.reduce((acc, cur) => acc + cur.duracao, 0);

  // Salva no localStorage
  localStorage.setItem('servicosSelecionados', JSON.stringify(selecionados));
  localStorage.setItem('totalPreco', totalPreco);
  localStorage.setItem('totalDuracao', totalDuracao);

  // Ir para próxima página (você pode trocar o link aqui depois)
  window.location.href = "etapa2.html";
}

// Eventos
categorias.forEach(btn => {
  btn.addEventListener('click', () => {
    const categoria = btn.dataset.categoria;
    mostrarSubservicos(categoria);
  });
});

voltarBtn.addEventListener('click', () => {
  categoriasSection.classList.remove('hidden');
  subservicosSection.classList.add('hidden');
});

btnAgendar.addEventListener('click', (e) => {
  e.preventDefault();
  salvarServicosSelecionados();
});
