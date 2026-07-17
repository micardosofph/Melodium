// Variáveis de escopo global (Inglês)
let audioContext = null;
let mediaStream = null;
let sourceNode = null;
let analyserNode = null;
let animationFrameId = null;
let isTunerRunning = false;

// Amortecimento da agulha (Filtro LERP)
let currentPointerCents = 0;
let targetPointerCents = 0;
const LERP_SMOOTHING_FACTOR = 0.15; 

// Histórico rítmico para média móvel de frequência
const frequencyHistory = [];
const HISTORY_MAX_SIZE = 5;

// Trava automática para desabilitar mocks externos
window.__tunerLiveEnabled = true;

// Seletores do DOM
const noteDisplayEl = document.querySelector('.afinador-note');
const frequencyDisplayEl = document.querySelector('.afinador-freq');
const meterPointerEl = document.getElementById('meter-pointer');
const toggleBtnEl = document.getElementById('tuner-toggle');
const statusTextEl = document.querySelector('.tuner-status-text');

// Frequência de referência do Lá 4 (A4)
const STANDARD_A4 = 440;
const REFERENCE_VOLUME = 0.6;

/**
 * Desconecta todos os nós de áudio e limpa as animações
 */
function stopTuning() {
  isTunerRunning = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = null;

  try {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
  } catch (error) {
    console.error('[Tuner] Erro ao desativar microfone:', error);
  }

  mediaStream = null;

  try {
    sourceNode?.disconnect();
  } catch (error) {
    console.error('[Tuner] Erro ao desconectar nós de áudio:', error);
  }

  sourceNode = null;
  analyserNode = null;

  if (audioContext) {
    audioContext.suspend().catch(() => {});
  }

  // Atualiza visual do botão para estado desligado
  if (toggleBtnEl) toggleBtnEl.classList.remove('recording');
  if (statusTextEl) statusTextEl.textContent = 'Microfone Desligado';

  if (noteDisplayEl) noteDisplayEl.textContent = '--';
  if (frequencyDisplayEl) frequencyDisplayEl.textContent = 'Frequência: -- Hz';
  
  targetPointerCents = 0;
  currentPointerCents = 0;
  setMeterFromCents(0);
}

/**
 * Mapeia frequência para notas musicais e desvio em cents
 */
function centsToNote(frequency) {
  const midiNote = Math.round(69 + 12 * Math.log2(frequency / STANDARD_A4));
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteName = noteNames[midiNote % 12];
  const octave = Math.floor(midiNote / 12) - 1;

  const targetFrequency = STANDARD_A4 * Math.pow(2, (midiNote - 69) / 12);
  const centsDeviation = 1200 * Math.log2(frequency / targetFrequency);

  return {
    midiNote,
    noteName,
    octave,
    targetFrequency,
    centsDeviation
  };
}

/**
 * Atualiza o ponteiro de cents na interface do usuário
 */
function setMeterFromCents(cents) {
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const pointerOffset = (clampedCents / 50) * 42; 
  if (meterPointerEl) {
    meterPointerEl.style.transform = `translate(calc(-50% + ${pointerOffset}px), -50%)`;
  }
}

/**
 * Algoritmo robusto de autocorrelação temporal com detecção do primeiro pico (Previne erros de harmônicos)
 */
function autoCorrelatePitch(audioBuffer, sampleRate) {
  let signalRootMeanSquare = 0;
  for (let i = 0; i < audioBuffer.length; i++) {
    const value = audioBuffer[i];
    signalRootMeanSquare += value * value;
  }
  signalRootMeanSquare = Math.sqrt(signalRootMeanSquare / audioBuffer.length);
  
  // Condição de silêncio para ignorar pequenos ruídos de fundo
  if (signalRootMeanSquare < 0.015) return null; 

  const bufferSize = audioBuffer.length;
  const maxLag = Math.floor(sampleRate / 60);  // Limite inferior (~60Hz)
  const minLag = Math.floor(sampleRate / 1000); // Limite superior (~1000Hz)

  const correlations = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    for (let i = 0; i < bufferSize - lag; i++) {
      correlation += audioBuffer[i] * audioBuffer[i + lag];
    }
    correlations[lag] = correlation;
  }

  // Encontra o pico de correlação absoluto
  let absoluteMaxCorrelation = -1;
  let absoluteMaxLag = -1;
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (correlations[lag] > absoluteMaxCorrelation) {
      absoluteMaxCorrelation = correlations[lag];
      absoluteMaxLag = lag;
    }
  }

  // ALGORITMO CHAVE: Procura o primeiro pico relevante (Threshold 90%)
  // Isso impede que frequências graves (como E2 de 82Hz) registrem harmônicos agudos (como B3)
  let correlationThreshold = absoluteMaxCorrelation * 0.9;
  let foundLag = absoluteMaxLag;

  for (let lag = minLag; lag <= maxLag; lag++) {
    if (correlations[lag] > correlationThreshold && 
        correlations[lag] > correlations[lag - 1] && 
        correlations[lag] > correlations[lag + 1]) {
      foundLag = lag;
      break;
    }
  }

  const wavePeriod = foundLag / sampleRate;
  const targetFrequency = 1 / wavePeriod;

  if (targetFrequency < 60 || targetFrequency > 1000) return null;
  return targetFrequency;
}

/**
 * Solicita acesso ao microfone e inicia o loop de monitoramento
 */
async function startTuning() {
  if (isTunerRunning) return;

  isTunerRunning = true;

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      } 
    });

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.3;

    sourceNode = audioContext.createMediaStreamSource(mediaStream);
    sourceNode.connect(analyserNode);

    // Altera visual do botão para modo ativo
    if (toggleBtnEl) toggleBtnEl.classList.add('recording');
    if (statusTextEl) statusTextEl.textContent = 'Ouvindo...';

    const dataBuffer = new Float32Array(analyserNode.fftSize);

    const detectionLoop = () => {
      if (!isTunerRunning) return;

      analyserNode.getFloatTimeDomainData(dataBuffer);

      const sampleRate = audioContext.sampleRate;
      let detectedFrequency = autoCorrelatePitch(dataBuffer, sampleRate);

      if (detectedFrequency) {
        // Aplica média móvel
        frequencyHistory.push(detectedFrequency);
        if (frequencyHistory.length > HISTORY_MAX_SIZE) {
          frequencyHistory.shift();
        }
        const averagedFrequency = frequencyHistory.reduce((sum, val) => sum + val, 0) / frequencyHistory.length;

        const { noteName, octave, centsDeviation } = centsToNote(averagedFrequency);
        
        if (noteDisplayEl) noteDisplayEl.textContent = `${noteName}${octave}`;
        if (frequencyDisplayEl) frequencyDisplayEl.textContent = `Frequência: ${averagedFrequency.toFixed(1)} Hz`;
        
        targetPointerCents = centsDeviation;
      } else {
        targetPointerCents = targetPointerCents * 0.95;
        if (Math.abs(targetPointerCents) < 0.1) targetPointerCents = 0;
      }

      // Aplica filtro LERP para movimento suave do ponteiro
      currentPointerCents = currentPointerCents + (targetPointerCents - currentPointerCents) * LERP_SMOOTHING_FACTOR;
      setMeterFromCents(currentPointerCents);

      animationFrameId = requestAnimationFrame(detectionLoop);
    };

    detectionLoop();
    console.log('[Tuner] Sessão de afinação iniciada');
  } catch (err) {
    isTunerRunning = false;
    console.error('[Tuner] Erro ao iniciar captura:', err);
    stopTuning();
    alert('Erro ao carregar o microfone. Verifique as permissões de gravação do seu navegador.');
  }
}

/**
 * Dispara ondas sonoras de referência para escuta manual das cordas
 */
function playReferenceTone(frequency, noteName) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (noteDisplayEl) noteDisplayEl.textContent = noteName;
  if (frequencyDisplayEl) frequencyDisplayEl.textContent = `Referência: ${frequency.toFixed(2)} Hz`;
  
  const referenceOscillator = audioContext.createOscillator();
  const referenceEnvelope = audioContext.createGain();

  referenceOscillator.type = 'sine';
  referenceOscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  referenceOscillator.connect(referenceEnvelope);
  referenceEnvelope.connect(audioContext.destination);

  referenceEnvelope.gain.setValueAtTime(0, audioContext.currentTime);
  referenceEnvelope.gain.linearRampToValueAtTime(REFERENCE_VOLUME, audioContext.currentTime + 0.1);
  referenceEnvelope.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.3);

  referenceOscillator.start();
  referenceOscillator.stop(audioContext.currentTime + 1.3);
}

// Alterna o estado de ativação do microfone (Gatilho único)
toggleBtnEl?.addEventListener('click', () => {
  if (isTunerRunning) {
    stopTuning();
  } else {
    startTuning();
  }
});