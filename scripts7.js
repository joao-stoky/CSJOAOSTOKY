document.addEventListener("DOMContentLoaded", function () {
  const url = "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=56278198";

  const blocos = {
    blocos1: [
      { titulo: "Acionamento", indices: [0,1,2,3], colunaData: 2 } // Coluna 2 contém as datas
    ],
  };

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(csv => {
      const linhas = csv.trim().split("\n").map(l => {
        return l.split(",").map(c => c.replace(/(^"|"$)/g, "").trim());
      });
      const cabecalhos = linhas[0];
      let dados = linhas.slice(1);
      
      // Função para converter string de data para objeto Date
      function parseDate(dateStr) {
        // Adapte este formato conforme o formato das suas datas
        const parts = dateStr.split('/');
        return new Date(parts[2], parts[1]-1, parts[0]); // DD/MM/YYYY
      }

      // Ordenar os dados por data (da mais antiga para a mais recente)
      dados.sort((a, b) => {
        const dateA = parseDate(a[blocos.blocos1[0].colunaData] || '');
        const dateB = parseDate(b[blocos.blocos1[0].colunaData] || '');
        return dateA - dateB;
      });

      renderizarBlocos(cabecalhos, dados, blocos);
    })
    .catch(err => {
      const container = document.getElementById("dashboard");
      container.innerHTML = `<p style="color:red;">Erro ao carregar os dados: ${err.message}</p>`;
    });

  function renderizarBlocos(cabecalhos, dados, blocos) {
    const container = document.getElementById("dashboard");
    container.innerHTML = "";
    container.classList.add("dashboard");

    blocos.blocos1.forEach(bloco => {
      const card = document.createElement("div");
      card.classList.add("card");

      if (bloco.titulo) {
        const tituloEl = document.createElement("h2");
        tituloEl.textContent = bloco.titulo;
        card.appendChild(tituloEl);
      }

      const tabelaContainer = document.createElement("div");
      tabelaContainer.classList.add("tabela-container");

      const tabela = document.createElement("table");

      // Cabeçalho
      const thead = document.createElement("thead");
      const trHead = document.createElement("tr");
      bloco.indices.forEach(i => {
        const th = document.createElement("th");
        th.textContent = cabecalhos[i] || "";
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);
      tabela.appendChild(thead);

      // Corpo da tabela
      const tbody = document.createElement("tbody");
      dados.forEach(linha => {
        const todasVazias = bloco.indices.every(i => {
          const celula = linha[i];
          return !celula || celula.trim() === "";
        });

        if (todasVazias) return;

        const tr = document.createElement("tr");

        bloco.indices.forEach(i => {
          const celula = linha[i] || "";
          const td = document.createElement("td");

          const linkMap = {
            "https://21427851.hs-sites.com/pt-br/atendimento.onfly.com": "HELP CENTER",
            "https://wa.me/553198779437": "WHATSAPP ONFLY",
            "https://app.onfly.com.br/v2?_gl=1*105sr0j*_gcl_au*NjA0NjIzOTE4LjE3NDcxMzk3MzcuMTg2MzE1NzM5Ni4xNzQ3NzQ5NDkyLjE3NDc3NDk0OTE.#/home": "CHAT",
            "https://suporte.onfly.com.br/tickets?offset=0": "CRIAR BUG",
          };

          if (/^https?:\/\//i.test(celula)) {
            const a = document.createElement("a");
            a.href = celula;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.textContent = linkMap[celula] || celula;
            td.appendChild(a);
          }
          else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(celula)) {
            const a = document.createElement("a");
            a.href = `mailto:${celula}`;
            a.textContent = celula;
            td.appendChild(a);
          } else {
            td.textContent = celula;
          }

          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      tabela.appendChild(tbody);
      tabelaContainer.appendChild(tabela);
      card.appendChild(tabelaContainer);
      container.appendChild(card);
    });
  }
});