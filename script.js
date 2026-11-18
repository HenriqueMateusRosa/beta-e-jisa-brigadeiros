
/* =====================================================
   BETA & JISA BRIGADEIROS
   SCRIPT.JS
   Carrinho + Flask + Supabase + WhatsApp
===================================================== */

const WHATSAPP_LOJA = "5554991934486";

const catalogoApi = new Map();

let carrinho = [];
let tempoAviso = null;
let ultimoFoco = null;
let pedidoEmAndamento = false;

/* ================= UTILITÁRIOS ================= */

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function escaparTexto(texto) {
  return String(texto).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[caractere]));
}

function mostrarAviso(mensagem, tipo = "sucesso") {
  const aviso = document.getElementById("avisoSite");

  if (!aviso) {
    console.log(mensagem);
    return;
  }

  clearTimeout(tempoAviso);

  aviso.textContent = mensagem;
  aviso.className = `aviso-site visivel ${tipo}`;

  tempoAviso = setTimeout(() => {
    aviso.classList.remove("visivel");
  }, 4500);
}

/* ================= CARRINHO ================= */

function recuperarCarrinho() {
  try {
    const salvo = JSON.parse(
      localStorage.getItem("carrinho") || "[]"
    );

    if (!Array.isArray(salvo)) return [];

    return salvo.filter(item =>
      item &&
      typeof item.nome === "string" &&
      Number.isFinite(Number(item.preco)) &&
      Number.isInteger(Number(item.qtd)) &&
      Number(item.qtd) > 0 &&
      Number(item.qtd) <= 100
    ).map(item => ({
      nome: item.nome,
      preco: Number(item.preco),
      qtd: Number(item.qtd)
    }));

  } catch (erro) {
    console.warn("Erro ao recuperar carrinho:", erro);
    return [];
  }
}

carrinho = recuperarCarrinho();

function salvarCarrinho() {
  localStorage.setItem(
    "carrinho",
    JSON.stringify(carrinho)
  );

  renderCarrinho();
}

function renderCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  const totalEl = document.getElementById("totalCarrinho");
  const contador = document.getElementById("contadorCarrinho");
  const finalizar = document.getElementById("botaoFinalizar");

  if (!lista || !totalEl) return;

  const quantidadeTotal = carrinho.reduce(
    (soma, item) => soma + item.qtd,
    0
  );

  const total = carrinho.reduce(
    (soma, item) => soma + item.preco * item.qtd,
    0
  );

  totalEl.textContent = formatarMoeda(total);

  if (contador) {
    contador.textContent =
      `${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`;
  }

  if (finalizar) {
    finalizar.disabled =
      carrinho.length === 0 || pedidoEmAndamento;
  }

  if (!carrinho.length) {
    lista.innerHTML = `
      <div class="carrinho-vazio">
        <span class="carrinho-vazio-icone">
          <i class="fa-solid fa-basket-shopping"></i>
        </span>
        <strong>Seu carrinho está vazio</strong>
        <p>Que tal adicionar alguns docinhos?</p>
      </div>
    `;
    return;
  }

  lista.innerHTML = carrinho.map((item, index) => {
    const subtotal = item.preco * item.qtd;

    return `
      <div class="carrinho-item">
        <span class="carrinho-item-quantidade">
          ${item.qtd}×
        </span>

        <div class="carrinho-item-detalhes">
          <strong>${escaparTexto(item.nome)}</strong>
          <small>${formatarMoeda(subtotal)}</small>
        </div>

        <button
          class="carrinho-remover"
          type="button"
          onclick="remover(${index})"
          aria-label="Remover ${escaparTexto(item.nome)}"
          title="Remover produto"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  }).join("");
}

/* ================= ADICIONAR PRODUTO ================= */

function adicionarProduto(evento) {
  const botao = evento.currentTarget;

  const card = botao.closest(
    ".produto-card, .categoria-card"
  );

  if (!card) return;

  const nome = card.dataset.nome;

  if (!nome) {
    mostrarAviso(
      "Não foi possível identificar o produto.",
      "erro"
    );
    return;
  }

  const produto = catalogoApi.get(nome);

  if (!produto) {
    mostrarAviso(
      "Produto indisponível no catálogo.",
      "erro"
    );
    return;
  }

  const campoQuantidade = card.querySelector(".qtd");

  const qtd = campoQuantidade
    ? Number(campoQuantidade.value)
    : 1;

  if (
    !Number.isInteger(qtd) ||
    qtd < 1 ||
    qtd > 100
  ) {
    mostrarAviso(
      "Informe uma quantidade entre 1 e 100.",
      "erro"
    );
    return;
  }

  // O preço oficial sempre vem do servidor.
  const preco = Number(produto.preco_centavos) / 100;

  if (!Number.isFinite(preco) || preco < 0) {
    mostrarAviso(
      "Preço do produto inválido.",
      "erro"
    );
    return;
  }

  const existente = carrinho.find(
    item => item.nome === nome
  );

  if (existente) {
    if (existente.qtd + qtd > 100) {
      mostrarAviso(
        "O limite é de 100 unidades por produto.",
        "erro"
      );
      return;
    }

    existente.qtd += qtd;
    existente.preco = preco;
  } else {
    carrinho.push({
      nome,
      preco,
      qtd
    });
  }

  salvarCarrinho();

  mostrarAviso(
    `${qtd} unidade(s) de ${nome} adicionada(s) ao carrinho!`
  );

  if (campoQuantidade) {
    campoQuantidade.value = "1";
  }
}

/* ================= REMOVER PRODUTO ================= */

function remover(index) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= carrinho.length
  ) {
    return;
  }

  const produto = carrinho[index];

  carrinho.splice(index, 1);

  salvarCarrinho();

  mostrarAviso(
    `${produto.nome} removido do carrinho.`
  );
}

/* ================= ABRIR/FECHAR CARRINHO ================= */

function toggleCarrinho() {
  const box = document.getElementById("carrinho");

  if (!box) return;

  const botao = box.querySelector(
    ".carrinho-cabecalho"
  );

  const fechado = box.classList.toggle("recolhido");

  if (botao) {
    botao.setAttribute(
      "aria-expanded",
      String(!fechado)
    );
  }
}

/* ================= CARREGAR CATÁLOGO ================= */

async function carregarCatalogo() {
  try {
    const resposta = await fetch("/api/produtos", {
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error(
        `Erro HTTP ${resposta.status}`
      );
    }

    const produtos = await resposta.json();

    if (!Array.isArray(produtos)) {
      throw new Error("Formato inválido do catálogo.");
    }

    catalogoApi.clear();

    produtos.forEach(produto => {
      catalogoApi.set(produto.nome, produto);
    });

    document.querySelectorAll(
      ".produto-card, .categoria-card"
    ).forEach(card => {
      const nome = card.dataset.nome;

      // Cards informativos não precisam
      // ter cadastro na API.
      if (!nome) return;

      const produto = catalogoApi.get(nome);
      const botao = card.querySelector(".btn-add");

      if (!produto) {
        card.style.display = "";

        if (botao) {
          botao.disabled = true;
          botao.title =
            "Produto ainda não cadastrado no sistema";
        }

        return;
      }

      card.style.display = "";

      const preco = Number(produto.preco_centavos) / 100;

      if (!Number.isFinite(preco) || preco < 0) {
        if (botao) botao.disabled = true;
        return;
      }

      card.dataset.preco = preco.toFixed(2);

      let precoEl = card.querySelector(".preco");

      if (!precoEl) {
        precoEl = document.createElement("span");
        precoEl.className = "preco preco-categoria";

        const titulo = card.querySelector(
          ".categoria-info h3"
        );

        if (titulo) {
          titulo.after(precoEl);
        } else {
          card.appendChild(precoEl);
        }
      }

      precoEl.textContent = formatarMoeda(preco);

      if (botao) {
        botao.disabled = false;
        botao.removeAttribute("title");
      }
    });

    // Atualiza os preços dos produtos já
    // adicionados ao carrinho.
    carrinho.forEach(item => {
      const produto = catalogoApi.get(item.nome);

      if (produto) {
        item.preco =
          Number(produto.preco_centavos) / 100;
      }
    });

    salvarCarrinho();

  } catch (erro) {
    console.error(
      "Erro ao carregar produtos:",
      erro
    );

    document.querySelectorAll(
      ".btn-add"
    ).forEach(botao => {
      botao.disabled = true;
    });

    mostrarAviso(
      "Não foi possível carregar o catálogo. Verifique o servidor.",
      "erro"
    );
  }
}

/* ================= CONTROLE DOS MODAIS ================= */

function atualizarBloqueioRolagem() {
  const modalPedido = document.getElementById(
    "modalPedido"
  );

  const modalConfirmacao = document.getElementById(
    "modalConfirmacao"
  );

  const algumModalAberto =
    (modalPedido && !modalPedido.hidden) ||
    (modalConfirmacao && !modalConfirmacao.hidden);

  document.body.classList.toggle(
    "modal-aberto",
    Boolean(algumModalAberto)
  );
}

/* ================= FINALIZAR PEDIDO ================= */

function finalizarPedido() {
  if (pedidoEmAndamento) return;

  if (!carrinho.length) {
    mostrarAviso(
      "Adicione pelo menos um produto ao carrinho.",
      "erro"
    );
    return;
  }

  const itensValidos = carrinho.every(item =>
    catalogoApi.has(item.nome)
  );

  if (!itensValidos) {
    mostrarAviso(
      "Há produtos indisponíveis no carrinho. Remova-os antes de continuar.",
      "erro"
    );
    return;
  }

  const modal = document.getElementById("modalPedido");
  const resumo = document.getElementById("resumoPedido");
  const totalModal = document.getElementById("totalModal");

  if (!modal || !resumo || !totalModal) {
    mostrarAviso(
      "Formulário indisponível. Atualize a página.",
      "erro"
    );
    return;
  }

  ultimoFoco = document.activeElement;

  resumo.innerHTML = carrinho.map(item => {
    const subtotal = item.preco * item.qtd;

    return `
      <div class="resumo-linha">
        <span>
          ${item.qtd}× ${escaparTexto(item.nome)}
        </span>
        <strong>${formatarMoeda(subtotal)}</strong>
      </div>
    `;
  }).join("");

  const total = carrinho.reduce(
    (soma, item) => soma + item.preco * item.qtd,
    0
  );

  totalModal.textContent = formatarMoeda(total);

  modal.hidden = false;

  atualizarBloqueioRolagem();

  document.getElementById("clientePedido")?.focus();
}

/* ================= FECHAR CHECKOUT ================= */

function fecharModalPedido() {
  if (pedidoEmAndamento) return;

  const modal = document.getElementById("modalPedido");

  if (!modal) return;

  modal.hidden = true;

  atualizarBloqueioRolagem();

  ultimoFoco?.focus();
}

/* ================= FECHAR CONFIRMAÇÃO ================= */

function fecharConfirmacao() {
  const modal = document.getElementById(
    "modalConfirmacao"
  );

  if (!modal) return;

  modal.hidden = true;

  atualizarBloqueioRolagem();

  ultimoFoco?.focus();
}

/* ================= REGISTRAR PEDIDO ================= */

async function registrarPedido(evento) {
  evento.preventDefault();

  if (pedidoEmAndamento) return;

  const formulario = evento.currentTarget;

  if (!formulario.reportValidity()) {
    return;
  }

  const cliente = document.getElementById(
    "clientePedido"
  ).value.trim();

  const telefone = document.getElementById(
    "telefonePedido"
  ).value.trim();

  const endereco = document.getElementById(
    "enderecoPedido"
  ).value.trim();

  const observacao = document.getElementById(
    "observacaoPedido"
  ).value.trim();

  if (!cliente || !telefone || !endereco) {
    mostrarAviso(
      "Preencha nome, telefone e endereço/retirada.",
      "erro"
    );
    return;
  }

  const itens = carrinho.map(item => ({
    produto_id: catalogoApi.get(item.nome)?.id,
    quantidade: Number(item.qtd)
  }));

  if (
    !itens.length ||
    itens.some(item =>
      !item.produto_id ||
      !Number.isInteger(item.quantidade) ||
      item.quantidade < 1 ||
      item.quantidade > 100
    )
  ) {
    mostrarAviso(
      "Verifique os produtos e as quantidades do pedido.",
      "erro"
    );
    return;
  }

  const botao = document.getElementById(
    "confirmarPedido"
  );

  pedidoEmAndamento = true;

  if (botao) {
    botao.disabled = true;
    botao.textContent = "Registrando pedido...";
  }

  renderCarrinho();

  try {
    const resposta = await fetch("/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cliente,
        telefone,
        endereco,
        observacao,
        itens
      })
    });

    let pedido;

    try {
      pedido = await resposta.json();
    } catch {
      throw new Error(
        "O servidor retornou uma resposta inválida."
      );
    }

    if (!resposta.ok) {
      throw new Error(
        pedido.erro || "Erro ao registrar pedido."
      );
    }

    const mensagem = [
      "🍫 Olá! Quero confirmar meu pedido Beta & Jisa.",
      "",
      `Pedido #${pedido.id}`,
      "",
      ...carrinho.map(item =>
        `${item.qtd}x ${item.nome}`
      ),
      "",
      `Total: ${formatarMoeda(pedido.total_centavos / 100)}`,
      `Cliente: ${cliente}`,
      `Telefone: ${telefone}`,
      `Endereço/retirada: ${endereco}`,
      observacao
        ? `Observações: ${observacao}`
        : "",
      "",
      "Pedido sujeito à disponibilidade dos produtos e confirmação da confeitaria."
    ].filter(Boolean).join("\n");

    const linkWhatsApp = document.getElementById(
      "linkConfirmacaoWhatsApp"
    );

    if (linkWhatsApp) {
      linkWhatsApp.href =
        `https://wa.me/${WHATSAPP_LOJA}?text=${encodeURIComponent(mensagem)}`;
    }

    const numeroPedido = document.getElementById(
      "confirmacaoNumero"
    );

    if (numeroPedido) {
      numeroPedido.textContent =
        `Pedido #${pedido.id}`;
    }

    carrinho = [];

    salvarCarrinho();

    formulario.reset();

    const modalPedido = document.getElementById(
      "modalPedido"
    );

    const modalConfirmacao = document.getElementById(
      "modalConfirmacao"
    );

    if (modalPedido) {
      modalPedido.hidden = true;
    }

    if (modalConfirmacao) {
      modalConfirmacao.hidden = false;
    }

    atualizarBloqueioRolagem();

    mostrarAviso(
      `Pedido #${pedido.id} registrado com sucesso!`
    );

    linkWhatsApp?.focus();

  } catch (erro) {
    console.error(
      "Erro ao registrar pedido:",
      erro
    );

    mostrarAviso(
      "Não foi possível registrar o pedido: " +
      erro.message,
      "erro"
    );

  } finally {
    pedidoEmAndamento = false;

    if (botao) {
      botao.disabled = false;
      botao.innerHTML = `
        <i class="fa-solid fa-check"></i>
        Confirmar pedido
      `;
    }

    renderCarrinho();
  }
}

/* ================= EVENTOS DOS MODAIS ================= */

function configurarModais() {
  const modalPedido = document.getElementById(
    "modalPedido"
  );

  const modalConfirmacao = document.getElementById(
    "modalConfirmacao"
  );

  const formulario = document.getElementById(
    "formularioPedido"
  );

  if (formulario) {
    formulario.addEventListener(
      "submit",
      registrarPedido
    );
  }

  if (modalPedido) {
    modalPedido.addEventListener("click", evento => {
      if (evento.target === modalPedido) {
        fecharModalPedido();
      }
    });
  }

  if (modalConfirmacao) {
    modalConfirmacao.addEventListener(
      "click",
      evento => {
        if (evento.target === modalConfirmacao) {
          fecharConfirmacao();
        }
      }
    );
  }

  document.addEventListener("keydown", evento => {
    const checkoutAberto =
      modalPedido && !modalPedido.hidden;

    const confirmacaoAberta =
      modalConfirmacao && !modalConfirmacao.hidden;

    if (!checkoutAberto && !confirmacaoAberta) {
      return;
    }

    const modalAtivo = checkoutAberto
      ? modalPedido
      : modalConfirmacao;

    if (evento.key === "Escape") {
      evento.preventDefault();

      if (checkoutAberto) {
        fecharModalPedido();
      } else {
        fecharConfirmacao();
      }

      return;
    }

    if (evento.key !== "Tab") return;

    const elementos = [
      ...modalAtivo.querySelectorAll(
        'button:not(:disabled), ' +
        'input:not(:disabled), ' +
        'textarea:not(:disabled), ' +
        'a[href]'
      )
    ].filter(elemento =>
      elemento.getClientRects().length > 0
    );

    if (!elementos.length) return;

    const primeiro = elementos[0];
    const ultimo = elementos[elementos.length - 1];

    if (
      evento.shiftKey &&
      document.activeElement === primeiro
    ) {
      evento.preventDefault();
      ultimo.focus();
    } else if (
      !evento.shiftKey &&
      document.activeElement === ultimo
    ) {
      evento.preventDefault();
      primeiro.focus();
    }
  });
}

/* ================= HEADER SCROLL ================= */

function configurarHeader() {
  const topo = document.getElementById("topo");

  if (!topo) return;

  function atualizarHeader() {
    topo.classList.toggle(
      "scrolled",
      window.scrollY > 40
    );
  }

  window.addEventListener(
    "scroll",
    atualizarHeader,
    { passive: true }
  );

  atualizarHeader();
}

/* ================= INICIALIZAÇÃO ================= */

function iniciarAplicacao() {
  document.querySelectorAll(".btn-add").forEach(
    botao => {
      botao.disabled = true;

      botao.addEventListener(
        "click",
        adicionarProduto
      );
    }
  );

  configurarModais();
  configurarHeader();
  renderCarrinho();
  carregarCatalogo();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacao
  );
} else {
  iniciarAplicacao();
}