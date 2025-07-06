import { execSync } from "node:child_process";
import {
  existsSync,
  rmSync,
  writeFileSync,
  lstatSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import path from "path";
import {
  WHISPER_LANG,
  WHISPER_MODEL,
  WHISPER_PATH,
  WHISPER_VERSION,
} from "./whisper-config.mjs";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const extractToTempAudioFile = (fileToTranscribe, tempOutFile) => {
  // Extracting audio from mp4 and save it as 16khz wav file
  console.log(`Converting ${fileToTranscribe} to 16kHz WAV format...`);
  execSync(
    `npx remotion ffmpeg -i "${fileToTranscribe}" -ar 16000 -ac 1 -sample_fmt s16 "${tempOutFile}" -y`,
    { stdio: ["ignore", "inherit"] },
  );
  console.log(`Audio extracted to: ${tempOutFile}`);
};

const subFile = async (filePath, fileName, folder) => {
  const outPath = path.join(
    process.cwd(),
    "public",
    folder,
    fileName.replace(".wav", ".json"),
  );

  const whisperCppOutput = await transcribe({
    inputPath: filePath,
    model: WHISPER_MODEL,
    tokenLevelTimestamps: true,
    whisperPath: WHISPER_PATH,
    whisperCppVersion: WHISPER_VERSION,
    printOutput: false,
    translateToEnglish: false,
    language: WHISPER_LANG,
    splitOnWord: true,
  });

  const { captions } = toCaptions({
    whisperCppOutput,
  });
  writeFileSync(
    outPath.replace("webcam", "subs"),
    JSON.stringify(captions, null, 2),
  );
};

const processVideo = async (fullPath, entry, directory) => {
  // Handle both video and audio files
  if (
    !fullPath.endsWith(".mp4") &&
    !fullPath.endsWith(".webm") &&
    !fullPath.endsWith(".mkv") &&
    !fullPath.endsWith(".mov") &&
    !fullPath.endsWith(".wav") &&
    !fullPath.endsWith(".mp3")
  ) {
    return;
  }

  const isTranscribed = existsSync(
    fullPath
      .replace(/.mp4$/, ".json")
      .replace(/.mkv$/, ".json")
      .replace(/.mov$/, ".json")
      .replace(/.webm$/, ".json")
      .replace(/.wav$/, ".json")
      .replace(/.mp3$/, ".json")
      .replace("webcam", "subs"),
  );
  if (isTranscribed) {
    return;
  }
  let shouldRemoveTempDirectory = false;
  if (!existsSync(path.join(process.cwd(), "temp"))) {
    mkdirSync(`temp`);
    shouldRemoveTempDirectory = true;
  }
  console.log("Processing file", entry);

  let tempOutFilePath;
  let tempWavFileName;

  // If it's already a WAV file, we still need to ensure it's 16kHz
  if (fullPath.endsWith(".wav")) {
    tempWavFileName = "converted_" + entry;
    tempOutFilePath = path.join(process.cwd(), `temp/${tempWavFileName}`);
    console.log("Converting WAV file to 16kHz format...");
    extractToTempAudioFile(fullPath, tempOutFilePath);
  } else {
    tempWavFileName = entry.split(".")[0] + ".wav";
    tempOutFilePath = path.join(process.cwd(), `temp/${tempWavFileName}`);
    console.log("Extracting audio from video file...");
    extractToTempAudioFile(fullPath, tempOutFilePath);
  }

  await subFile(
    tempOutFilePath,
    tempWavFileName,
    path.relative("public", directory),
  );
  if (shouldRemoveTempDirectory) {
    rmSync(path.join(process.cwd(), "temp"), { recursive: true });
  }
};

const processDirectory = async (directory) => {
  const entries = readdirSync(directory).filter((f) => f !== ".DS_Store");

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stat = lstatSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath); // Recurse into subdirectories
    } else {
      await processVideo(fullPath, entry, directory);
    }
  }
};

await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });

// Read arguments for filename if given else process all files in the directory
const hasArgs = process.argv.length > 2;

if (!hasArgs) {
  await processDirectory(path.join(process.cwd(), "public"));
  process.exit(0);
}

for (const arg of process.argv.slice(2)) {
  const fullPath = path.join(process.cwd(), arg);
  const stat = lstatSync(fullPath);

  if (stat.isDirectory()) {
    await processDirectory(fullPath);
    continue;
  }

  console.log(`Processing file ${fullPath}`);
  const directory = path.dirname(fullPath);
  const fileName = path.basename(fullPath);
  await processVideo(fullPath, fileName, directory);
}
