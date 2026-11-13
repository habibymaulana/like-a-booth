// Initialized synchronously by the Start Session gesture. Each short voice owns
// its context; repeated requests are ignored until that voice has been released.
let active = false;
export function playShutter(delayMs = 120) {
  if (active) return;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  let context, timer;
  const release = () => {
    clearTimeout(timer);
    active = false;
    if (context && context.state !== 'closed') context.close().catch(() => {});
  };
  try {
    context = new Audio();
    active = true;
    // Invoke resume during the gesture, before any asynchronous work.
    const resumed = context.resume();
    const duration = .16;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      const t = i / context.sampleRate;
      const click = Math.exp(-t * 180);
      const releaseClick = t < .045 ? 0 : .5 * Math.exp(-(t - .045) * 85);
      samples[i] = (Math.random() * 2 - 1) * (click + releaseClick);
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 650;
    const gain = context.createGain(); gain.gain.value = .16;
    source.connect(filter); filter.connect(gain); gain.connect(context.destination);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); release(); };
    source.start(context.currentTime + delayMs / 1000);
    timer = setTimeout(release, delayMs + 1000);
    resumed?.catch(release);
  } catch { release(); }
}
