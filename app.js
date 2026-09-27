const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');

function showView(id) {
  views.forEach(v => v.classList.toggle('active', v.id === id));

  navLinks.forEach(b =>
    b.classList.toggle('active', b.dataset.view === id)
  );

  history.replaceState(null, '', `#${id}`);

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

navLinks.forEach(btn => {
  btn.addEventListener('click', () => {
    showView(btn.dataset.view);
  });
});

const allowedViews = new Set([
  'dashboard',
  'monitoring',
  'classifications'
]);

const initial = location.hash.replace('#', '');

if (allowedViews.has(initial)) {
  showView(initial);
}


/* =========================================================
   DATOS SIMULADOS
   ========================================================= */

const recentOperations = [
  {
    time: '10:24:12',
    residue: 'Lata de aluminio',
    category: 'Aluminio',
    result: 'Clasificación exitosa',
    duration: '4.2 s'
  },
  {
    time: '10:23:48',
    residue: 'Tapa plástica',
    category: 'Plástico',
    result: 'Clasificación exitosa',
    duration: '4.5 s'
  },
  {
    time: '10:23:21',
    residue: 'Caja de cartón',
    category: 'Cartón',
    result: 'Clasificación exitosa',
    duration: '3.9 s'
  },
  {
    time: '10:22:56',
    residue: 'Lata de aluminio',
    category: 'Aluminio',
    result: 'Clasificación exitosa',
    duration: '4.1 s'
  }
];


const historyRows = [
  {
    date: '21/04/2025 10:24:12',
    residue: 'Lata de aluminio',
    category: 'Aluminio',
    confidence: '94%',
    result: 'Correcta',
    duration: '4.2 s'
  },
  {
    date: '21/04/2025 10:23:48',
    residue: 'Botella plástica',
    category: 'Plástico',
    confidence: '87%',
    result: 'Correcta',
    duration: '4.5 s'
  },
  {
    date: '21/04/2025 10:23:21',
    residue: 'Caja de cartón',
    category: 'Cartón',
    confidence: '91%',
    result: 'Correcta',
    duration: '3.9 s'
  },
  {
    date: '21/04/2025 10:22:56',
    residue: 'Tapa plástica',
    category: 'Plástico',
    confidence: '76%',
    result: 'Fallida',
    duration: '5.8 s'
  },
  {
    date: '21/04/2025 10:22:14',
    residue: 'Tubo de cartón',
    category: 'Cartón',
    confidence: '82%',
    result: 'Correcta',
    duration: '4.0 s'
  },
  {
    date: '21/04/2025 10:21:33',
    residue: 'Lata de aluminio',
    category: 'Aluminio',
    confidence: '89%',
    result: 'Correcta',
    duration: '4.1 s'
  }
];


/* =========================================================
   CATEGORÍAS
   ========================================================= */

const tagClass = category => {
  return category
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};


/* =========================================================
   ÚLTIMAS OPERACIONES - DASHBOARD
   ========================================================= */

function renderRecent() {
  const tbody = document.getElementById('recentOperations');

  tbody.innerHTML = recentOperations.map(row => `
    <tr>

      <td>
        ${row.time}
      </td>

      <td class="residue-cell">
        <span>${row.residue}</span>
        <span class="tag ${tagClass(row.category)}">
          ${row.category}
        </span>
      </td>

      <td>
        <span class="result ${row.result === 'Clasificación exitosa' ? 'ok' : 'fail'}">
          ${row.result === 'Clasificación exitosa' ? '●' : '×'} ${row.result}
        </span>
      </td>

      <td>
        ${row.duration}
      </td>

    </tr>
  `).join('');
}


/* =========================================================
   HISTORIAL DE CLASIFICACIONES
   ========================================================= */

function renderHistory() {
  const tbody = document.getElementById('classificationHistory');

  tbody.innerHTML = historyRows.map(row => `
    <tr>

      <td>
        ${row.date}
      </td>

      <td>
        ${row.residue}
      </td>

      <td>
        <span class="tag ${tagClass(row.category)}">
          ${row.category}
        </span>
      </td>

      <td>
        ${row.confidence}
      </td>

      <td>

        <span
          class="result ${
            row.result === 'Correcta'
              ? 'ok'
              : 'fail'
          }"
        >

          ${
            row.result === 'Correcta'
              ? '●'
              : '×'
          }

          ${row.result}

        </span>

      </td>

      <td>
        ${row.duration}
      </td>

    </tr>
  `).join('');
}


/* =========================================================
   SIMULACIÓN EN TIEMPO REAL
   ========================================================= */

const stages = [
  { state: 'Detectando', duration: 650 },
  { state: 'Localizando', duration: 600 },
  { state: 'Planificando', duration: 700 },
  { state: 'Sujetando', duration: 700 },
  { state: 'Trasladando', duration: 1100 },
  { state: 'Clasificando', duration: 650 }
];

const cycleDuration = stages.reduce((total, stage) => total + stage.duration, 0);
const processSteps = document.querySelectorAll('[data-process-step]');
const timelineSteps = document.querySelectorAll('[data-timeline-step]');
const simulationToggle = document.getElementById('simulationToggle');

let cycleStartedAt = Date.now();
let pausedAt = 0;
let simulationPaused = false;
let lastStage = -1;
let lastCoordinateUpdate = 0;
let confidence = 94;
let position = { x: 215, y: 132, z: 48 };
let processedToday = 48;
let totalOperations = 128;
let successfulOperations = 119;
let failedOperations = 9;
let averageDuration = 4.3;

const getById = id => document.getElementById(id);

function setText(id, value, refresh = false) {
  const element = getById(id);

  if (!element || element.textContent === String(value)) {
    return;
  }

  element.textContent = value;

  if (refresh) {
    element.classList.remove('data-refresh');
    void element.offsetWidth;
    element.classList.add('data-refresh');
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatClock(date) {
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function formatDateTime(date) {
  return `${date.toLocaleDateString('es-PE')} ${formatClock(date)}`;
}

function seedOperationTimes() {
  const now = Date.now();

  recentOperations.forEach((row, index) => {
    row.time = formatClock(new Date(now - (index + 1) * 38000));
  });

  historyRows.forEach((row, index) => {
    row.date = formatDateTime(new Date(now - (index + 1) * 52000));
  });
}

function updateDetectionData(refresh = false) {
  const confidenceText = `${confidence}%`;
  const positionText = `X: ${position.x} mm | Y: ${position.y} mm | Z: ${position.z} mm`;
  const detectionText = `Lata · Aluminio · ${confidenceText}`;

  setText('dashboardResidue', 'Lata', refresh);
  setText('dashboardCategory', 'Aluminio', refresh);
  setText('dashboardConfidence', confidenceText, refresh);
  setText('previewDetectionLabel', detectionText);
  setText('liveDetectionLabel', detectionText);
  setText('operationResidue', 'Lata de aluminio', refresh);
  setText('operationConfidence', confidenceText, refresh);
  setText('operationPosition', positionText, refresh);
  setText('operationDestination', 'Contenedor de aluminio');
  setText('detectedResidue', 'Lata de aluminio', refresh);
  setText('detectedCategory', 'Aluminio');
  setText('detectedConfidence', confidenceText, refresh);
  setText('detectedPosition', positionText, refresh);
  setText('targetDestination', 'Contenedor de aluminio');
  setText('targetPosition', positionText, refresh);
}

function beginCycle() {
  confidence = randomInt(91, 98);
  position = {
    x: randomInt(208, 221),
    y: randomInt(126, 137),
    z: randomInt(44, 51)
  };
  lastStage = -1;
  updateDetectionData(true);
}

function stageAt(elapsed) {
  let accumulated = 0;

  for (let index = 0; index < stages.length; index += 1) {
    accumulated += stages[index].duration;

    if (elapsed < accumulated) {
      return index;
    }
  }

  return stages.length - 1;
}

function stageStartAt(stageIndex) {
  return stages
    .slice(0, stageIndex)
    .reduce((total, stage) => total + stage.duration, 0);
}

function updateStepStates(stageIndex, elapsed) {
  processSteps.forEach((step, index) => {
    const status = index < stageIndex ? 'done' : index === stageIndex ? 'current' : 'pending';
    const statusChanged = !step.classList.contains(status);

    if (statusChanged) {
      step.classList.remove('done', 'current', 'pending');
      step.classList.add(status);
      step.querySelector('small').textContent = status === 'done'
        ? 'Completado'
        : status === 'current'
          ? 'En proceso'
          : 'Pendiente';
    }
  });

  timelineSteps.forEach((step, index) => {
    const status = index < stageIndex ? 'done' : index === stageIndex ? 'current' : 'pending';
    const marker = step.querySelector('span');
    const duration = step.querySelector('em');
    const statusChanged = !step.classList.contains(status);

    if (statusChanged) {
      step.classList.remove('done', 'current', 'pending');
      step.classList.add(status);
      marker.innerHTML = status === 'done' ? '<svg><use href="#i-check"/></svg>' : '';
    }

    if (status === 'done') {
      duration.textContent = `${(stages[index].duration / 1000).toFixed(1)} s`;
    } else if (status === 'current') {
      duration.textContent = `${Math.max(0, (elapsed - stageStartAt(index)) / 1000).toFixed(1)} s`;
    } else {
      duration.textContent = '—';
    }
  });
}

function updateStageSummary(stageIndex, refresh = false) {
  const state = stages[stageIndex].state;
  const gripperClosed = stageIndex === 3 || stageIndex === 4;

  setText('dashboardMonitorState', state, refresh);
  setText('monitorState', state, refresh);
  setText('currentStage', `${stageIndex + 1} de ${stages.length}`, refresh);
  setText('gripperState', gripperClosed ? 'Cerrada' : 'Abierta', refresh);
  setText('gripperDetail', gripperClosed ? 'Sujetando el objeto.' : 'Lista para el siguiente movimiento.');
}

function updateSummaryCards() {
  const successPercentage = ((successfulOperations / totalOperations) * 100).toFixed(1);
  const failurePercentage = ((failedOperations / totalOperations) * 100).toFixed(1);

  setText('processedToday', processedToday, true);
  setText('totalOperations', totalOperations, true);
  setText('successfulOperations', successfulOperations, true);
  setText('failedOperations', failedOperations, true);
  setText('successRate', `${successPercentage}% del total`);
  setText('failureRate', `${failurePercentage}% del total`);
  setText('averageTime', `${averageDuration.toFixed(1)} s`, true);
}

function completeCycle() {
  const completedAt = new Date();
  const successful = Math.random() >= 0.07;
  const duration = `${(cycleDuration / 1000).toFixed(1)} s`;
  const result = successful ? 'Clasificación exitosa' : 'Revisión requerida';

  recentOperations.unshift({
    time: formatClock(completedAt),
    residue: 'Lata de aluminio',
    category: 'Aluminio',
    result,
    duration
  });
  recentOperations.splice(4);

  historyRows.unshift({
    date: formatDateTime(completedAt),
    residue: 'Lata de aluminio',
    category: 'Aluminio',
    confidence: `${confidence}%`,
    result: successful ? 'Correcta' : 'Fallida',
    duration
  });
  historyRows.splice(6);

  const previousTotal = totalOperations;
  processedToday += 1;
  totalOperations += 1;
  successfulOperations += successful ? 1 : 0;
  failedOperations += successful ? 0 : 1;
  averageDuration = ((averageDuration * previousTotal) + (cycleDuration / 1000)) / totalOperations;

  renderRecent();
  renderHistory();
  updateSummaryCards();
}

function updateSimulation() {
  if (simulationPaused) {
    return;
  }

  const now = Date.now();
  let elapsed = now - cycleStartedAt;

  if (elapsed >= cycleDuration) {
    completeCycle();
    cycleStartedAt = now;
    elapsed = 0;
    beginCycle();
  }

  const stageIndex = stageAt(elapsed);
  const progress = Math.min(100, (elapsed / cycleDuration) * 100);
  const stageChanged = stageIndex !== lastStage;

  if (stageChanged) {
    updateStageSummary(stageIndex, true);
    lastStage = stageIndex;
  }

  if (now - lastCoordinateUpdate > 450) {
    position.x += randomInt(-1, 1);
    position.y += randomInt(-1, 1);
    position.z += randomInt(-1, 1);
    updateDetectionData();
    lastCoordinateUpdate = now;
  }

  updateStepStates(stageIndex, elapsed);
  setText('dashboardCycleTime', `${(elapsed / 1000).toFixed(1)} s`);
  setText('elapsedCycle', `${(elapsed / 1000).toFixed(1)} s`);
  getById('cycleProgress').style.width = `${progress}%`;
}

simulationToggle.addEventListener('click', () => {
  simulationPaused = !simulationPaused;
  document.body.classList.toggle('simulation-paused', simulationPaused);
  simulationToggle.setAttribute('aria-pressed', String(simulationPaused));

  if (simulationPaused) {
    pausedAt = Date.now();
    setText('dashboardMonitorState', 'Simulación pausada');
    setText('monitorState', 'Simulación pausada');
    simulationToggle.querySelector('.pause-symbol').textContent = '▶';
    simulationToggle.querySelector('.toggle-label').textContent = 'Reanudar';
  } else {
    cycleStartedAt += Date.now() - pausedAt;
    simulationToggle.querySelector('.pause-symbol').textContent = 'Ⅱ';
    simulationToggle.querySelector('.toggle-label').textContent = 'Pausar';
    lastStage = -1;
    updateSimulation();
  }
});


/* =========================================================
   RELOJ DEL SISTEMA
   ========================================================= */

function updateClock() {

  const now = new Date();

  const date = now.toLocaleDateString(
    'es-PE',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  );

  const time = now.toLocaleTimeString(
    'es-PE',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
  );

  document.getElementById(
    'currentDateTime'
  ).textContent = `${date} ${time}`;

  if (!simulationPaused) {
    document.getElementById(
      'lastUpdated'
    ).textContent = time;

    setText('feedTime', time);
    setText('previewFeedTime', time);
    setText('feedFps', `${(29 + Math.random() * 1.8).toFixed(1)} FPS`);
  }
}


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

seedOperationTimes();
renderRecent();
renderHistory();
updateSummaryCards();
beginCycle();
updateClock();
updateSimulation();

setInterval(updateClock, 1000);
setInterval(updateSimulation, 100);
