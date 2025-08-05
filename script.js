const subservicos = {
  unha: [
    { nome: "Manicure", preco: 30, duracao: 30, foto: "assets/manicure.jpg" },
    { nome: "Pedicure", preco: 35, duracao: 40, foto: "assets/pedicure.jpg" },
    { nome: "Unha em gel", preco: 70, duracao: 90, foto: "assets/unha-gel.jpg" }
  ],
  cabelo: [
    { nome: "Corte feminino", preco: 50, duracao: 45, foto: "assets/corte-feminino.jpg" },
    { nome: "Escova", preco: 40, duracao: 40, foto: "assets/escova.jpg" },
    { nome: "Hidratação", preco: 60, duracao: 60, foto: "assets/hidratacao.jpg" }
  ],
  maquiagem: [
    { nome: "Make básica", preco: 50, duracao: 30, foto: "assets/make-basica.jpg" },
    { nome: "Make festa", preco: 80, duracao: 60, foto: "assets/make-festa.jpg" }
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
const totalPrecoSpan = document.getElementById('total-preco');
const totalDuracaoSpan = document.getElementById('total-duracao');

const modalImagem = document.getElementById('modal-imagem');
const imagemAmpliada = document.getElementById('imagem-ampliada');
const btnFecharModal = document.getElementById('fechar-modal');

let selecionados = [];

// Mostrar subserviços da categoria clicada
function mostrarSubservicos(categoria) {
  listaSubservicos.innerHTML = '';
  subservicos[categoria].forEach(servico => {
    const btn = document.createElement('button');
    btn.className = 'btn-subservico';

    // Estrutura interna do botão
    btn.innerHTML = `
      <img src="${servico.foto}" alt="${servico.nome}" class="foto-servico-pequena" />
      <div class="info-servico">
        <span class="nome-servico">${servico.nome}</span>
        <span class="detalhes-servico">R$${servico.preco} - ${servico.duracao} min</span>
      </div>
    `;

    // Clique no botão adiciona ou remove serviço
    btn.addEventListener('click', (e) => {
      // Se clicou na imagem, abre modal para ampliar
      if (e.target.classList.contains('foto-servico-pequena')) {
        e.stopPropagation(); // não dispara o adicionarServico
        abrirModalImagem(servico.foto, servico.nome);
        return;
      }
      if (selecionados.find(s => s.nome === servico.nome)) {
        removerServico(servico.nome);
      } else {
        adicionarServico(servico);
      }
    });

    // Se estiver selecionado, marca visualmente
    if (selecionados.find(s => s.nome === servico.nome)) {
      btn.classList.add('selecionado');
    }

    listaSubservicos.appendChild(btn);
  });

  categoriasSection.classList.add('hidden');
  subservicosSection.classList.remove('hidden');
}

// Adicionar serviço selecionado
function adicionarServico(servico) {
  if (selecionados.find(s => s.nome === servico.nome)) return;
  selecionados.push(servico);
  atualizarLista();
  atualizarSelecionadosVisual();
}

// Remover serviço selecionado
function removerServico(nome) {
  selecionados = selecionados.filter(s => s.nome !== nome);
  atualizarLista();
  atualizarSelecionadosVisual();
}

// Atualiza a lista de serviços selecionados na tela e totais
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

  // Atualiza totais
  const totalPreco = selecionados.reduce((acc, cur) => acc + cur.preco, 0);
  const totalDuracao = selecionados.reduce((acc, cur) => acc + cur.duracao, 0);
  totalPrecoSpan.textContent = totalPreco;
  totalDuracaoSpan.textContent = totalDuracao;
}

// Atualiza visualmente os botões de subserviço marcando os selecionados
function atualizarSelecionadosVisual() {
  const botoes = listaSubservicos.querySelectorAll('.btn-subservico');
  botoes.forEach(btn => {
    const nome = btn.querySelector('.nome-servico').textContent;
    if (selecionados.find(s => s.nome === nome)) {
      btn.classList.add('selecionado');
    } else {
      btn.classList.remove('selecionado');
    }
  });
}

// Salva no localStorage e redireciona para a página do agendamento
function salvarServicosSelecionados() {
  if (selecionados.length === 0) {
    msgErro.textContent = 'Selecione pelo menos um serviço para agendar.';
    return;
  }
  msgErro.textContent = '';

  // Salva no localStorage
  localStorage.setItem('servicosSelecionados', JSON.stringify(selecionados));

  // Redireciona para a página do agendamento (ajuste o nome do arquivo se precisar)
  window.location.href = "agendamento.html";
}

// Modal imagem funções
function abrirModalImagem(src, alt) {
  imagemAmpliada.src = src;
  imagemAmpliada.alt = alt;
  modalImagem.classList.remove('hidden');
}

function fecharModalImagem() {
  modalImagem.classList.add('hidden');
  imagemAmpliada.src = '';
  imagemAmpliada.alt = '';
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

btnFecharModal.addEventListener('click', fecharModalImagem);

// Fecha modal ao clicar fora da imagem
modalImagem.addEventListener('click', (e) => {
  if (e.target === modalImagem) fecharModalImagem();
});

// Ao carregar a página, lê localStorage e atualiza lista e visual
document.addEventListener('DOMContentLoaded', () => {
  const dados = localStorage.getItem('servicosSelecionados');
  if (dados) {
    selecionados = JSON.parse(dados);
    atualizarLista();
  }
});
