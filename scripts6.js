document.addEventListener("DOMContentLoaded", function () {
  const url = "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=91963344";

  const blocos = {
    blocos1: [
      { titulo: "SUPORTE", indices: [0, 1] },
      { titulo: "HELP CENTER", indices: [2] },
      { titulo: "ATENDIMENTO RESERVAS", indices: [3] },
      { titulo: "BUGS", indices: [5] },
      { titulo: "BLIP", indices: [6, 7] },
      { titulo: "EMISSÕES", indices: [8, 9] },
      { titulo: "ATENDIMENTO N1", indices: [10, 11] },
      { titulo: "ATENDIMENTO N2", indices: [12, 13] },
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
      const dados = linhas.slice(1);
      renderizarBlocos(cabecalhos, dados, blocos);
    })
    .catch(err => {
      const container = document.getElementById("dashboard");
      container.innerHTML = `<p style="color:red;">Erro ao carregar os dados: ${err.message}</p>`;
    });

  function renderizarBlocos(cabecalhos, dados, blocos) {
    const container = document.getElementById("dashboard");
    container.innerHTML = "";
    container.classList.add("dashboard"); // aplica grid principal

    blocos.blocos1.forEach(bloco => {
      const card = document.createElement("div");
      card.classList.add("card");

      // Título
      if (bloco.titulo) {
        const tituloEl = document.createElement("h2");
        tituloEl.textContent = bloco.titulo;
        card.appendChild(tituloEl);
      }

      // Container da tabela para scroll horizontal
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

      // Corpo
      const tbody = document.createElement("tbody");
      dados.forEach(linha => {
        // Verifica se todas as células relevantes para este bloco estão vazias
        const todasVazias = bloco.indices.every(i => {
          const celula = linha[i];
          return !celula || celula.trim() === "";
        });

        if (todasVazias) return; // pula a linha se todas as células estiverem vazias

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
            a.textContent = linkMap[celula] || celula; // usa nome amigável se existir
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
