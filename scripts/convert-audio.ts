import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Convierte un archivo de audio a un formato WAV estándar usando FFmpeg
 * Esto ayuda a solucionar problemas de compatibilidad con el parser de Remotion
 */
export async function convertAudioToStandardWAV(inputPath: string, outputPath?: string): Promise<string> {
  const absoluteInputPath = path.resolve(inputPath);
  const absoluteOutputPath = outputPath 
    ? path.resolve(outputPath)
    : path.resolve(path.dirname(absoluteInputPath), `fixed_${path.basename(absoluteInputPath)}`);

  // Verificar que el archivo de entrada existe
  if (!fs.existsSync(absoluteInputPath)) {
    throw new Error(`Input file does not exist: ${absoluteInputPath}`);
  }

  try {
    // Comando FFmpeg para convertir a WAV estándar
    // -acodec pcm_s16le: codec de audio PCM 16-bit little endian (estándar)
    // -ar 44100: frecuencia de muestreo 44.1kHz (estándar)
    // -ac 2: 2 canales (estéreo)
    const command = `ffmpeg -i "${absoluteInputPath}" -acodec pcm_s16le -ar 44100 -ac 2 -y "${absoluteOutputPath}"`;
    
    console.log('Converting audio file...');
    console.log('Command:', command);
    
    execSync(command, { stdio: 'inherit' });
    
    console.log(`Audio file converted successfully: ${absoluteOutputPath}`);
    return absoluteOutputPath;
  } catch (error) {
    console.error('Error converting audio file:', error);
    throw new Error(`Failed to convert audio file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Script para convertir el archivo de audio problemático
 */
if (require.main === module) {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3];
  
  if (!inputFile) {
    console.error('Usage: node convert-audio.js <input-file> [output-file]');
    process.exit(1);
  }
  
  convertAudioToStandardWAV(inputFile, outputFile)
    .then((outputPath) => {
      console.log(`Successfully converted: ${outputPath}`);
    })
    .catch((error) => {
      console.error('Conversion failed:', error);
      process.exit(1);
    });
}
