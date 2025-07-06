// Datos de subtítulos cargados desde el archivo JSON
export interface SubtitleSegment {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number;
}

// Para cargar los datos, en un proyecto real podrías usar fetch o importar directamente
// Por ahora, vamos a crear una función que simule los datos o los cargue desde el JSON
export const getSubtitlesData = (): SubtitleSegment[] => {
  // Aquí cargarías los datos del archivo JSON
  // Por simplicidad, voy a devolver un array vacío por ahora
  // En producción, podrías usar fetch para cargar desde staticFile
  return [];
};

// Datos de subtítulos reales del archivo JSON
export const sampleSubtitles: SubtitleSegment[] = [
  {
    text: "Y si los trabajadores más importantes del planeta",
    startMs: 60,
    endMs: 2400,
    timestampMs: 1230,
    confidence: 0.95
  },
  {
    text: "fueran diminutos, peludos y trabajarán",
    startMs: 2400,
    endMs: 5200,
    timestampMs: 3800,
    confidence: 0.94
  },
  {
    text: "a cambio de absolutamente nada",
    startMs: 5200,
    endMs: 7500,
    timestampMs: 6350,
    confidence: 0.96
  },
  {
    text: "¿qué pasaría si desaparecieran?",
    startMs: 7500,
    endMs: 10000,
    timestampMs: 8750,
    confidence: 0.93
  },
  {
    text: "Las abejas son responsables de un tercio",
    startMs: 10000,
    endMs: 13000,
    timestampMs: 11500,
    confidence: 0.97
  },
  {
    text: "de toda la comida que consumimos",
    startMs: 13000,
    endMs: 16000,
    timestampMs: 14500,
    confidence: 0.95
  },
  {
    text: "Sin ellas, no tendríamos frutas",
    startMs: 16000,
    endMs: 19000,
    timestampMs: 17500,
    confidence: 0.94
  },
  {
    text: "ni verduras en nuestros supermercados",
    startMs: 19000,
    endMs: 22000,
    timestampMs: 20500,
    confidence: 0.96
  }
];
