// Configuração de Afinação Padrão (E A D G B E)
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STRING_TUNINGS = [4, 11, 7, 2, 9, 4]; // Mizinha até Mizão
const STRING_LABELS = ["e", "B", "G", "D", "A", "E"];
const TOTAL_FRETS = 12; // Aumentado para 12 casas para abranger mais acordes

let currentFrets = [-1, -1, -1, -1, -1, -1];

function buildFretboard() {
  const container = document.getElementById("fretboard");
  container.innerHTML = "";

  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    const row = document.createElement("div");
    row.className = "string-row";

    const label = document.createElement("div");
    label.className = "string-label";
    label.innerText = STRING_LABELS[stringIdx];
    row.appendChild(label);

    const openCell = createCell(stringIdx, 0);
    openCell.classList.add("open-fret");
    row.appendChild(openCell);

    for (let fretIdx = 1; fretIdx <= TOTAL_FRETS; fretIdx++) {
      const cell = createCell(stringIdx, fretIdx);
      row.appendChild(cell);
    }

    container.appendChild(row);
  }
  updateUI();
}

function createCell(stringIdx, fretIdx) {
  const cell = document.createElement("div");
  cell.className = "fret-cell";
  
  cell.addEventListener("click", () => {
    if (fretIdx === 0) {
      currentFrets[stringIdx] = currentFrets[stringIdx] === 0 ? -1 : 0;
    } else {
      currentFrets[stringIdx] = currentFrets[stringIdx] === fretIdx ? -1 : fretIdx;
    }
    updateUI();
    identifyChord();
  });

  return cell;
}

function updateUI() {
  const rows = document.querySelectorAll(".string-row");

  rows.forEach((row, stringIdx) => {
    const cells = row.querySelectorAll(".fret-cell");
    const activeFret = currentFrets[stringIdx];

    cells.forEach((cell, fretIdx) => {
      cell.innerHTML = "";

      if (fretIdx === 0) {
        const marker = document.createElement("span");
        marker.className = "marker " + (activeFret === 0 ? "open" : "muted");
        marker.innerText = activeFret === 0 ? "O" : "X";
        cell.appendChild(marker);
      } else if (fretIdx === activeFret) {
        const marker = document.createElement("span");
        marker.className = "marker pressed";
        marker.innerText = fretIdx;
        cell.appendChild(marker);
      }
    });
  });
}

// LÓGICA AUTOMÁTICA DE IDENTIFICAÇÃO DE ACORDES COM TONAL.JS
function identifyChord() {
  const nameEl = document.getElementById("chord-name");
  const notesEl = document.getElementById("chord-notes");

  // Coleta as notas soando da mais grave para a mais aguda
  const activeNotes = [];
  
  for (let stringIdx = 5; stringIdx >= 0; stringIdx--) {
    const fret = currentFrets[stringIdx];
    if (fret !== -1) {
      const noteValue = (STRING_TUNINGS[stringIdx] + fret) % 12;
      activeNotes.push(NOTE_NAMES[noteValue]);
    }
  }

  if (activeNotes.length === 0) {
    nameEl.innerText = "Selecione as notas...";
    notesEl.innerText = "";
    return;
  }

  // Remove notas duplicadas mantendo a ordem do baixo (nota mais grave)
  const uniqueNotes = [...new Set(activeNotes)];

  // Detecta automaticamente o nome do acorde
  const detectedChords = Tonal.Chord.detect(uniqueNotes);

  if (detectedChords && detectedChords.length > 0) {
    // Exibe o primeiro acorde encontrado (o mais provável)
    nameEl.innerText = detectedChords[0];
    
    // Se houver nomes alternativos para essa mesma posição, exibe também
    if (detectedChords.length > 1) {
      const alternates = detectedChords.slice(1, 3).join(", ");
      notesEl.innerText = `Notas: ${uniqueNotes.join(" - ")} | Outros nomes: ${alternates}`;
    } else {
      notesEl.innerText = `Notas: ${uniqueNotes.join(" - ")}`;
    }
  } else {
    nameEl.innerText = "Acorde Desconhecido";
    notesEl.innerText = `Notas: ${uniqueNotes.join(" - ")}`;
  }
}

document.getElementById("btn-clear").addEventListener("click", () => {
  currentFrets = [-1, -1, -1, -1, -1, -1];
  updateUI();
  identifyChord();
});

buildFretboard();