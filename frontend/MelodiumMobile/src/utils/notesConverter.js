export function converterFrequenciaParaNota(frequencia) {
  // Ignora ruídos muito baixos que não são notas musicais
  if (!frequencia || frequencia < 20) return "--";

  // Array com as 12 notas da escala cromática
  const notas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  // Fórmula matemática para calcular a distância em semitons da nota A4 (440 Hz)
  const semitonsDeA4 = Math.round(12 * Math.log2(frequencia / 440));
  
  // A nota "A" é o índice 9 no nosso array. 
  // Somamos a distância e usamos o módulo (%) para achar a nota certa.
  let indiceNota = (9 + semitonsDeA4) % 12;
  
  // Correção caso a nota seja muito grave e o índice dê negativo
  if (indiceNota < 0) {
    indiceNota += 12;
  }

  return notas[indiceNota];
}