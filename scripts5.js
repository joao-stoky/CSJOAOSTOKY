const url = "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=384231685";

fetch(url)
  .then(response => response.text())
  .then(csv => {
    const linhas = csv.trim().split("\n");
    const dadosPorCapital = {};

    for (let i = 1; i < linhas.length; i++) {
      const colunas = linhas[i].split(",");

      if (colunas.length < 6) continue;

      const capital = colunas[0];
      const nomeAeroporto = colunas[1];
      const codigoICAO = colunas[2];
      const codigoIATA = colunas[3];
      const link = colunas[4];
      const descricao = colunas.slice(5).join(",");

      if (!dadosPorCapital[capital]) {
        dadosPorCapital[capital] = [];
      }

      dadosPorCapital[capital].push({
        nomeAeroporto,
        codigoICAO,
        codigoIATA,
        link,
        descricao
      });
    }

    const container = document.getElementById("tabela-aeroportos");

    const capitaisOrdenadas = Object.keys(dadosPorCapital).sort();

    capitaisOrdenadas.forEach(capital => {
      const secao = document.createElement("div");
      secao.className = "bloco-aeroporto";

      const titulo = document.createElement("h2");
      titulo.textContent = capital;
      secao.appendChild(titulo);

      dadosPorCapital[capital].forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `
          <p><strong>${item.nomeAeroporto}</strong></p>
          <p>Códigos: ICAO <strong>${item.codigoICAO}</strong> / IATA <strong>${item.codigoIATA}</strong></p>
          <p><a href="${item.link}" target="_blank">${item.descricao}</a></p>
          <hr />
        `;
        secao.appendChild(div);
      });

      container.appendChild(secao);
    });
  })
  .catch(error => console.error("Erro ao carregar os dados:", error));
