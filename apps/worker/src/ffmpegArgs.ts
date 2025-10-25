// Returns a static ffmpeg command that generates a 2s color test video
// with silent audio, writing to /tmp/out.mp4. The worker may adjust
// the output path for Windows at runtime.
export function ffmpegArgs() {
  const out = '/tmp/out.mp4';
  const args = [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'color=c=black:s=1920x1080:d=2',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=r=48000:cl=stereo',
    '-shortest',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    out,
  ];
  return { args, out };
}

