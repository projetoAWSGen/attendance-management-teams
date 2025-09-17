// Calcula a diferença entre duas horas e retorna no formato 'X h Y min'
function calcularTempoEmSala(horaEntrada, horaSaida) {
  if (!horaEntrada || !horaSaida) return "";
  function toMinutes(hora) {
    if (!hora) return null;
    const [hms, periodo] = hora.trim().split(" ");
    if (!hms || !periodo) return null;
    let [h, m, s] = hms.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    if (periodo.toUpperCase() === "PM" && h !== 12) h += 12;
    if (periodo.toUpperCase() === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }
  const minEntrada = toMinutes(horaEntrada);
  const minSaida = toMinutes(horaSaida);
  if (minEntrada === null || minSaida === null) return "";
  let diff = minSaida - minEntrada;
  if (diff < 0) diff += 24 * 60; // caso passe da meia-noite
  const horas = Math.floor(diff / 60);
  const minutos = diff % 60;
  return `${horas} h ${minutos} min`;
}
function getDiaSemana(dataHora) {
  if (!dataHora) return "";
  const [data] = dataHora.split(",");
  if (!data) return "";
  const [mes, dia, ano] = data.trim().split("/").map(Number);
  const anoCorrigido = ano < 100 ? 2000 + ano : ano;
  const date = new Date(anoCorrigido, mes - 1, dia);
  const dias = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  // Retorna só a primeira palavra do dia
  return dias[date.getDay()].split("-")[0];
}

function getDataHoraSeparada(dataHora) {
  if (!dataHora) return { data: "", hora: "" };
  const partes = dataHora.split(",");
  if (partes.length < 2) return { data: dataHora.trim(), hora: "" };
  return { data: partes[0].trim(), hora: partes[1].trim() };
}

document.getElementById("csvForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const fileInput = document.getElementById("csvInput");
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    const text = evt.target.result;
    const lines = text.split(/\r?\n/);
    // Procura a seção de participantes
    let secaoIdx = lines.findIndex((l) =>
      l.trim().toLowerCase().includes("2. participantes")
    );
    if (secaoIdx === -1) {
      document.getElementById("msg").textContent =
        "Seção de participantes não encontrada.";
      return;
    }
    // O cabeçalho deve estar logo após a seção
    let startIdx = secaoIdx + 1;
    while (startIdx < lines.length && lines[startIdx].trim() === "") startIdx++;
    if (
      startIdx >= lines.length ||
      !lines[startIdx].includes("Nome") ||
      !lines[startIdx].includes("Primeira Entrada") ||
      !lines[startIdx].includes("Última Saída")
    ) {
      document.getElementById("msg").textContent =
        "Cabeçalho da tabela de participantes não encontrado.";
      return;
    }
    // Coleta os dados até o fim ou próxima seção
    let participantes = [];
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || /^\d+\./.test(line)) break;
      const cols = line.split("\t");
      if (cols.length < 5) continue;
      // Exclui emails com @external.generation.org
      if (cols[4] && cols[4].includes("@external.generation.org")) continue;
      // Limpa o nome, removendo o que está entre parênteses
      const nomeLimpo = cols[0].replace(/\s*\(.*\)\s*$/, "").trim();
      // Separa data e hora da entrada
      const entrada = getDataHoraSeparada(cols[1]);
      // Separa data e hora da saída
      const saida = getDataHoraSeparada(cols[2]);
      participantes.push({
        Nome: nomeLimpo,
        Data: entrada.data,
        "Dia da Semana": getDiaSemana(cols[1]),
        Entrada: entrada.hora,
        Saida: saida.hora,
        "Tempo em sala": calcularTempoEmSala(entrada.hora, saida.hora),
      });
    }
    participantes.sort((a, b) => a.Nome.localeCompare(b.Nome, "pt-BR"));
    const header = "Nome,Data,Dia da Semana,Entrada,Saída,Tempo em sala\n";
    const csv = participantes
      .map(
        (p) =>
          `"${p.Nome}","${p.Data}","${p["Dia da Semana"]}","${p.Entrada}","${p.Saida}","${p["Tempo em sala"]}"`
      )
      .join("\n");
    const blob = new Blob([header + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_organizado.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    document.getElementById("msg").textContent = "Arquivo gerado com sucesso!";
  };
  reader.readAsText(file, "utf-8");
});
