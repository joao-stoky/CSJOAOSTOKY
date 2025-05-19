document.addEventListener("DOMContentLoaded", () => {
    const url = "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=1994793497";

    fetch(url)
        .then(response => response.text())
        .then(csv => {
            const data = Papa.parse(csv, {
                header: false,
                skipEmptyLines: true
            }).data;

            const tabela = document.getElementById("tabela-dados");
            const thead = tabela.querySelector("thead");
            const tbody = tabela.querySelector("tbody");

            // Cabeçalhos
            const headers = data[0];
            thead.innerHTML = "<tr>" + headers.map(h => `<th>${h.trim()}</th>`).join("") + "</tr>";

            // Linhas
            for (let i = 1; i < data.length; i++) {
                const linha = data[i];
                const linhaHTML = "<tr>" + linha.map(c => `<td>${c.trim()}</td>`).join("") + "</tr>";
                tbody.innerHTML += linhaHTML;
            }
        })
        .catch(error => {
            console.error("Erro ao carregar os dados:", error);
        });

    // Alternar tema
    document.getElementById("modo-tema").addEventListener("click", () => {
        document.body.classList.toggle("modo-escuro");
    });
});
