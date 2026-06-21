export type PortalSound =
  | "adminNewRegistration"
  | "adminApprove"
  | "adminReject"
  | "studentWelcome";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

function playTone(
  frequency: number,
  start: number,
  duration: number,
  options: {
    type?: OscillatorType;
    volume?: number;
    detune?: number;
  } = {}
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const { type = "sine", volume = 0.22, detune = 0 } = options;

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  oscillator.detune.value = detune;

  const startAt = ctx.currentTime + start;
  const endAt = startAt + duration;

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.05);
}

function playSequence(
  notes: Array<{ freq: number; start: number; duration: number; volume?: number; type?: OscillatorType }>
) {
  for (const note of notes) {
    playTone(note.freq, note.start, note.duration, {
      volume: note.volume,
      type: note.type,
    });
  }
}

export function playPortalSound(sound: PortalSound) {
  switch (sound) {
    case "adminNewRegistration":
      playSequence([
        { freq: 880, start: 0, duration: 0.12, volume: 0.2 },
        { freq: 1174.66, start: 0.1, duration: 0.18, volume: 0.24, type: "triangle" },
        { freq: 1567.98, start: 0.22, duration: 0.28, volume: 0.2, type: "triangle" },
      ]);
      break;
    case "adminApprove":
      playSequence([
        { freq: 523.25, start: 0, duration: 0.14, volume: 0.22 },
        { freq: 659.25, start: 0.1, duration: 0.14, volume: 0.22 },
        { freq: 783.99, start: 0.2, duration: 0.14, volume: 0.22 },
        { freq: 1046.5, start: 0.32, duration: 0.35, volume: 0.26, type: "triangle" },
      ]);
      break;
    case "adminReject":
      playSequence([
        { freq: 440, start: 0, duration: 0.2, volume: 0.24, type: "square" },
        { freq: 311.13, start: 0.16, duration: 0.35, volume: 0.2, type: "triangle" },
      ]);
      break;
    case "studentWelcome":
      playSequence([
        { freq: 523.25, start: 0, duration: 0.1, volume: 0.2 },
        { freq: 659.25, start: 0.08, duration: 0.1, volume: 0.2 },
        { freq: 783.99, start: 0.16, duration: 0.1, volume: 0.22 },
        { freq: 987.77, start: 0.24, duration: 0.1, volume: 0.22 },
        { freq: 1174.66, start: 0.32, duration: 0.1, volume: 0.24 },
        { freq: 1567.98, start: 0.42, duration: 0.55, volume: 0.28, type: "triangle" },
      ]);
      break;
  }
}

/** Resume audio after a user click so later sounds can play. */
export function primePortalSounds() {
  getAudioContext();
}
