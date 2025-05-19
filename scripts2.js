document.addEventListener('DOMContentLoaded', function () {
  // Configuração inicial
  const params = new URLSearchParams(window.location.search);
  const nomeEmpresa = params.get("empresa");

  if (!nomeEmpresa) {
    document.getElementById("dashboard").innerHTML = "<p style='color:red;'>Nome da empresa não fornecido.</p>";
    throw new Error("Nome da empresa não fornecido.");
  }

  document.getElementById("titulo").textContent = nomeEmpresa;
  document.title = nomeEmpresa;

  // URLs dos CSVs
  const csvUrls = [
    "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=1336444748",
    "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=1842256029",
    "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=1835294483",
    "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=453852044"
  ];

  // Função para parsear CSV
  function parseCSV(csv) {
    return csv.trim().split("\n").map(line => line.split(",").map(c => c.replace(/"/g, "").trim()));
  }

  // Carrega todos os CSVs
  Promise.all(csvUrls.map(url => fetch(url).then(r => r.text())))
    .then(([csv1, csv2, csv3, csv4]) => {
      const [linhas1, linhas2, linhas3, linhas4] = [csv1, csv2, csv3, csv4].map(parseCSV);
      const [cabecalhos1, cabecalhos2, cabecalhos3, cabecalhos4] = [linhas1, linhas2, linhas3, linhas4].map(linhas => linhas[0]);
      const registros = [linhas1, linhas2, linhas3, linhas4].map(linhas => linhas.slice(1));

      const dadosEmpresa = [
        registros[0].find(row => row[1] === nomeEmpresa),
        registros[1].find(row => row[1] === nomeEmpresa),
        registros[2].find(row => row[1] === nomeEmpresa),
        registros[3].find(row => row[1] === nomeEmpresa)
      ];

      if (!dadosEmpresa.some(dados => dados)) {
        document.getElementById("dashboard").innerHTML = "<p style='color:red;'>Empresa não encontrada nas abas.</p>";
        return;
      }

      // Definição dos blocos
      const blocos = {
        blocos1: [
          { titulo: "DADOS", indices: [0, 1, 2, 3, 6, 7, 8, 9, 10] },
          { titulo: "TRAVEL MANAGER", indices: [14, 15, 16, 17] },
          { titulo: "INFORMAÇÕES RELEVANTES", indices: [19, 24] },
          { titulo: "", indices: [31, 32] },
          { titulo: "CONTRATO", indices: [11, 12, 13, 18] },
          { titulo: "PRODUTOS ONFLY", indices: [20, 21, 22, 23] },
          { titulo: "OPORTUNIDADES", indices: [35, 26, 27, 28, 29, 30] }
        ],
        blocos2: [
          { titulo: "Bugs Mapeados", indices: [2, 3, 4, 5, 6] }
        ],
        blocos3: [
          { titulo: "HEALTH SCORE", indices: [8, 3, 4, 5, 6, 7] }
        ],
        blocos4: [
          { titulo: "GMV", indices: [3, 4, 5, 6, 7, 8] }
        ]
      };

      // Ordem de renderização dos blocos
      const blocosOrdenados = [
        ...blocos.blocos1.slice(0, 2), // DADOS e TRAVEL MANAGER
        ...blocos.blocos2,             // Bugs Mapeados
        blocos.blocos1[2],             // INFORMAÇÕES RELEVANTES
        ...blocos.blocos3,             // HEALTH SCORE
        ...blocos.blocos4,             // GMV
        ...blocos.blocos1.slice(3)     // Restante dos blocos1
      ];

      // Renderiza os blocos
      // Criação dos blocos com seus respectivos dados e cabeçalhos
      criarBlocos(blocos.blocos1, cabecalhos1, dadosEmpresa[0]);
      criarBlocos(blocos.blocos2, cabecalhos2, dadosEmpresa[1]);
      criarBlocos(blocos.blocos3, cabecalhos3, dadosEmpresa[2]);
      criarBlocos(blocos.blocos4, cabecalhos4, dadosEmpresa[3]);


      // Adiciona botão de voltar
      const voltar = document.createElement("a");
      voltar.href = "index.html";
      voltar.className = "voltar";
      voltar.textContent = "← Voltar para a lista";
      document.getElementById("dashboard").appendChild(voltar);

      // Ajusta fonte dos títulos
      ajustarFonte();
    })
    .catch(error => {
      document.getElementById("dashboard").innerHTML = "<p style='color:red;'>Erro ao carregar os dados.</p>";
      console.error("Erro ao carregar os CSVs:", error);
    });

  // Função para criar blocos
  function criarBlocos(blocos, cabecalhos, dadosEmpresa) {
    const dashboard = document.getElementById("dashboard");

    blocos.forEach(bloco => {
      const container = document.createElement("div");
      container.className = "bloco";

      if (bloco.titulo.trim() !== "") {
        const titulo = document.createElement("h3");
        titulo.textContent = bloco.titulo;
        container.appendChild(titulo);
      }

      const grid = document.createElement("div");
      grid.className = "grid";

      bloco.indices.forEach(i => {
        if (cabecalhos[i]) {
          const card = criarCard(cabecalhos[i], dadosEmpresa[i], bloco.titulo, i);
          grid.appendChild(card);
        }
      });

      container.appendChild(grid);
      dashboard.appendChild(container);
    });
  }

  // Função para criar cards
  function criarCard(cabecalho, valor, tituloBloco, indice) {
    const card = document.createElement("div");
    card.className = "card";

    const valorUpper = valor ? valor.toString().trim().toUpperCase() : "";
    const cabecalhoUpper = cabecalho.trim().toUpperCase();

    // Aplica classes condicionais
    aplicarClassesCondicionais(card, valorUpper, cabecalhoUpper, tituloBloco, indice);

    // Processa URLs
    let valorHTML = valor;
    if (valor && /^https?:\/\/.+/.test(valor)) {
      valorHTML = `<a href="${valor}" target="_blank" rel="noopener noreferrer">${valor}</a>`;
    } else {
      valorHTML = valor || '';
    }

    card.innerHTML = `<h2>${cabecalho}</h2><p>${valorHTML}</p>`;
    return card;
  }

  // Função para aplicar classes condicionais
  function aplicarClassesCondicionais(card, valorUpper, cabecalhoUpper, tituloBloco, indice) {
    // HEALTH SCORE STATUS
    if (cabecalhoUpper === "HEALTH SCORE STATUS") {
      if (valorUpper === "SUBIU") card.classList.add("subiu");
      else if (valorUpper === "CAIU") card.classList.add("caiu");
    }

    // GMV - Percentual
    if (tituloBloco === "GMV" && indice === 5) {
      const percentual = parseFloat(valorUpper.replace('%', '').replace(',', '.'));

      if (!isNaN(percentual)) {
        if (percentual === 0) card.classList.add("f0");
        else if (percentual <= 20) card.classList.add("f0-20");
        else if (percentual <= 40) card.classList.add("f21-40");
        else if (percentual <= 60) card.classList.add("f41-60");
        else if (percentual <= 70) card.classList.add("f61-70");
        else if (percentual <= 80) card.classList.add("f71-80");
        else if (percentual <= 90) card.classList.add("f81-90");
        else card.classList.add("f91-100");
      }
    }

    // GMV - Meta
    if (tituloBloco === "GMV" && indice === 8) {
      if (valorUpper === "SIM") card.classList.add("fSim");
      else if (valorUpper === "QUASE") card.classList.add("fQuase");
    }

    // Centralizado/Descentralizado
    if (indice === 19) {
      if (valorUpper === "DESCENTRALIZADO") card.classList.add("descentralizado");
      else if (valorUpper === "CENTRALIZADO") card.classList.add("centralizado");
    }

    // SIM/NÃO
    if (indice === 24 || [25, 26, 27, 28, 29, 30].includes(indice)) {
      if (valorUpper === "SIM") card.classList.add(indice === 24 ? "sim" : "sim2");
      else if (valorUpper === "NÃO" || valorUpper === "NAO") card.classList.add(indice === 24 ? "nao" : "nao2");
    }

    // PRODUTOS ONFLY
   // Dentro da função criarCard:
if (tituloBloco === "PRODUTOS ONFLY" && [20, 21, 22, 23].includes(indice)) {
  if (valorUpper === "SIM") {
    card.style.backgroundColor = "#28a745";
    card.style.color = "white";
  } else if (valorUpper === "NÃO" || valorUpper === "NAO") {
    card.style.backgroundColor = "#dc3545";
    card.style.color = "#FFFFFF";
    card.classList.add("card-vermelho"); // Adiciona esta linha
  }
}
  }

  // Função para ajustar fonte
  function ajustarFonte() {
    const titulos = document.querySelectorAll('.card h2');
    titulos.forEach(titulo => {
      titulo.style.fontSize = '24px';
      while (titulo.scrollWidth > titulo.clientWidth && parseInt(titulo.style.fontSize) > 12) {
        titulo.style.fontSize = `${parseInt(titulo.style.fontSize) - 1}px`;
      }
    });
  }

 // Botão de tema - Alterna entre Light / Dark / Super Dark
const btnTema = document.getElementById("btnTema");
let temaAtual = localStorage.getItem("tema") || "light";

// Aplica o tema ao carregar
aplicarTema(temaAtual);

btnTema.addEventListener("click", () => {
  if (temaAtual === "light") {
    temaAtual = "dark";
  } else if (temaAtual === "dark") {
    temaAtual = "super-dark";
  } else {
    temaAtual = "light";
  }
  
  aplicarTema(temaAtual);
  localStorage.setItem("tema", temaAtual);
});

function aplicarTema(tema) {
  document.body.className = tema;
  
  // Altera o texto do botão para indicar o próximo tema
  if (tema === "light") {
    btnTema.textContent = "🌙 Modo Escuro";
  } else if (tema === "dark") {
    btnTema.textContent = "🌚 Super Dark";
  } else {
    btnTema.textContent = "☀️ Modo Claro";
  }
}

  // Verifica tema ao carregar
  if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark");
  }

  // Event listeners para redimensionamento
  window.addEventListener('resize', ajustarFonte);
});