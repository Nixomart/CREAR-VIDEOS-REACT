const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script para convertir archivos de audio problemáticos a formato WAV estándar
 * Esto soluciona problemas de compatibilidad con el parser de Remotion
 */

const inputFile = 'public/audio/tts_1751823872736.wav';
const outputFile = 'public/audio/tts_1751823872736_fixed.wav';

console.log('Converting problematic audio file...');

try {
  // Verificar que el archivo de entrada existe
  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file does not exist: ${inputFile}`);
  }

  // Comando FFmpeg para convertir a WAV estándar
  const command = `ffmpeg -i "${inputFile}" -acodec pcm_s16le -ar 44100 -ac 2 -y "${outputFile}"`;
  
  console.log('Running command:', command);
  
  execSync(command, { stdio: 'inherit' });
  
  console.log(`✅ Audio file converted successfully: ${outputFile}`);
  console.log('');
  console.log('Now you can update your Root.tsx to use the fixed audio file:');
  console.log(`audioSrc: staticFile("audio/tts_1751823872736_fixed.wav"),`);
  
} catch (error) {
  console.error('❌ Error converting audio file:', error.message);
  console.log('');
  console.log('Possible solutions:');
  console.log('1. Install FFmpeg: https://ffmpeg.org/download.html');
  console.log('2. Or try removing the audio temporarily by commenting out the audioSrc line');
  console.log('3. Or try using a different audio file');
}
