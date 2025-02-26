import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const compressVideo = (inputPath: string): Promise<string> => {
  const outputPath = `${inputPath.replace(/\.[^/.]+$/, "")}-compressed.webm`;

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v libvpx-vp9", // Use VP9 codec
        "-crf 35", // Constant Rate Factor (quality setting, 0-63)
        "-b:v 8000k", // Target bitrate
        "-maxrate 8000k", // Maximum bitrate
        "-bufsize 10000k", // Buffer size (2x maxrate)
        "-vf",
        "scale='min(1920,iw):-2',fps=fps=60", // Scale to 1080p and limit to 60fps
        "-deadline realtime", // Fastest encoding speed
        "-cpu-used 8", // Maximum CPU usage for speed
        "-row-mt 1", // Enable row-based multithreading
        "-tile-columns 4", // Use more tile columns for parallel processing
        "-frame-parallel 1", // Enable parallel frame processing
        "-threads 0", // Use all available CPU threads
        "-speed 8", // Fastest encoding speed (0-8)
        "-static-thresh 0", // Disable static threshold for faster processing
        "-drop-threshold 30", // Allow more frame drops for speed
        "-lag-in-frames 0", // Disable frame lag for faster processing
        "-c:a libopus", // Audio codec
        "-b:a 128k", // Audio bitrate
        "-ac 2", // Stereo audio
        "-ar 48000", // Audio sample rate
      ])
      .toFormat("webm")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
};
