// Original synthesis only: no recordings, samples, or borrowed melody.
export class ExperienceAudio {
  private context: AudioContext | null = null;
  private music: GainNode | null = null;
  private drones: OscillatorNode[] = [];
  private interval: ReturnType<typeof setInterval> | null = null;
  private lastShutter = 0;
  private note = 0;

  private async ready() {
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") await this.context.resume();
    return this.context;
  }

  async shutter() {
    if (performance.now() - this.lastShutter < 80) return;
    this.lastShutter = performance.now();
    const context = await this.ready();
    [0, 0.065].forEach((offset, i) => {
      const duration = i ? 0.065 : 0.028;
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (data.length / 5));
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = i ? 1600 : 2800;
      filter.Q.value = 0.7;
      gain.gain.value = 0.23;
      source.connect(filter).connect(gain).connect(context.destination);
      source.start(context.currentTime + offset);
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    });
  }

  async startMusic() {
    const context = await this.ready();
    if (this.music) return;
    const bus = context.createGain();
    bus.gain.setValueAtTime(0, context.currentTime);
    bus.gain.linearRampToValueAtTime(0.34, context.currentTime + 1.5);
    bus.connect(context.destination);
    this.music = bus;
    // A quiet tonic/fifth drone with sparse bell harmonics, not a raga recording.
    [130.81, 196, 261.62, 262.15].forEach((frequency, i) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = i < 2 ? 0.075 : 0.025;
      oscillator.connect(gain).connect(bus);
      oscillator.start();
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      this.drones.push(oscillator);
    });
    const bell = () => {
      if (!this.music || context.state !== "running") return;
      const sequence = [523.25, 784, 587.33, 659.25, 784, 523.25];
      const frequency = sequence[this.note++ % sequence.length];
      [1, 2.01, 3.98].forEach((harmonic, i) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = frequency * harmonic;
        gain.gain.setValueAtTime(0, context.currentTime);
        gain.gain.linearRampToValueAtTime(0.055 / (i + 1), context.currentTime + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 3.4);
        oscillator.connect(gain).connect(bus);
        oscillator.start();
        oscillator.stop(context.currentTime + 3.5);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    };
    bell();
    this.interval = setInterval(bell, 4100);
  }

  stopMusic() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    const context = this.context;
    const bus = this.music;
    if (context && bus) {
      bus.gain.cancelScheduledValues(context.currentTime);
      bus.gain.setTargetAtTime(0, context.currentTime, 0.12);
      this.drones.forEach(node => node.stop(context.currentTime + 0.6));
    }
    this.drones = [];
    this.music = null;
  }

  async setVisible(visible: boolean) {
    if (!this.context || this.context.state === "closed") return;
    if (visible) await this.context.resume();
    else await this.context.suspend();
  }

  dispose() {
    this.stopMusic();
    void this.context?.close();
    this.context = null;
  }
}
