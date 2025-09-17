// Format date to Brazilian format (DD/MM/YYYY)
function formatDateToBR(dateStr) {
  if (!dateStr) return "";
  const [month, day, year] = dateStr.trim().split("/").map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  const dayStr = String(day).padStart(2, "0");
  const monthStr = String(month).padStart(2, "0");
  return `${dayStr}/${monthStr}/${fullYear}`;
}
function calculateTimeInRoom(entryTime, exitTime) {
  if (!entryTime || !exitTime) return "";
  const entryMinutes = timeStringToMinutes(entryTime);
  const exitMinutes = timeStringToMinutes(exitTime);
  if (entryMinutes === null || exitMinutes === null) return "";
  let diff = exitMinutes - entryMinutes;
  if (diff < 0) diff += 24 * 60;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours} h ${minutes} min`;
}

function getDayOfWeek(dateTimeStr) {
  if (!dateTimeStr) return "";
  const [date] = dateTimeStr.split(",");
  if (!date) return "";
  const [month, day, year] = date.trim().split("/").map(Number);
  const correctedYear = year < 100 ? 2000 + year : year;
  const jsDate = new Date(correctedYear, month - 1, day);
  const dias = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  return dias[jsDate.getDay()].split("-")[0].trim();
}

function splitDateTime(dateTimeStr) {
  if (!dateTimeStr) return { date: "", time: "" };
  const parts = dateTimeStr.split(",");
  if (parts.length < 2) return { date: dateTimeStr.trim(), time: "" };
  return { date: parts[0].trim(), time: parts[1].trim() };
}

function timeStringToMinutes(timeStr) {
  if (!timeStr) return null;
  const [hms, period] = timeStr.trim().split(" ");
  if (!hms || !period) return null;
  let [h, m, s] = hms.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  if (period.toUpperCase() === "PM" && h !== 12) h += 12;
  if (period.toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + m;
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
    const sectionIdx = lines.findIndex((l) =>
      l.trim().toLowerCase().includes("2. participantes")
    );
    if (sectionIdx === -1) {
      document.getElementById("msg").textContent =
        "Participants section not found.";
      return;
    }
    let startIdx = sectionIdx + 1;
    while (startIdx < lines.length && lines[startIdx].trim() === "") startIdx++;
    if (
      startIdx >= lines.length ||
      !lines[startIdx].includes("Nome") ||
      !lines[startIdx].includes("Primeira Entrada") ||
      !lines[startIdx].includes("Última Saída")
    ) {
      document.getElementById("msg").textContent =
        "Participants table header not found.";
      return;
    }
    const participants = [];
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || /^\d+\./.test(line)) break;
      const cols = line.split("\t");
      if (cols.length < 5) continue;
      if (cols[4] && cols[4].includes("@external.generation.org")) continue;
      const cleanName = cols[0].replace(/\s*\(.*\)\s*$/, "").trim();
      const entry = splitDateTime(cols[1]);
      const exit = splitDateTime(cols[2]);
      // Only add if entry and exit are present
      if (!entry.date || !entry.time || !exit.time) continue;
      participants.push({
        name: cleanName,
        date: formatDateToBR(entry.date),
        dayOfWeek: getDayOfWeek(cols[1]),
        entry: entry.time,
        exit: exit.time,
        timeInRoom: calculateTimeInRoom(entry.time, exit.time),
      });
    }
    participants.sort((a, b) => a.name.localeCompare(b.name, "en-US"));
    const header = "Nome,Data,Dia da Semana,Entrada,Saída,Tempo em Sala\n";
    const csv = participants
      .map(
        (p) =>
          `"${p.name}","${p.date}","${p.dayOfWeek}","${p.entry}","${p.exit}","${p.timeInRoom}"`
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
