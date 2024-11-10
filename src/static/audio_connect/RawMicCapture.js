/**
 * @file Module for PCM fetching from mic
 *
 * Note: It supports only mixed to monaural output
 *
 * @author aKuad
 */


/**
 * Module for PCM fetching from mic
 */
export class RawMicCapture extends EventTarget {
  /**
   * Blank constructor for EventTarget construction
   *
   * All processes are in `start_capture` method, because async process can't be in constructor
   */
  constructor() {
    super();
  }


  /**
   * Dispatch when sample buffer reached to specified frame length
   *
   * @event RawMicCapture#frame-ready
   * @type {MessageEvent}
   * @property {Array<number>} data Fetched PCM array at float
   */

  /**
   * Start PCM fetching from mic
   *
   * @param {number} sample_rate Sample rate of PCM of callback argument
   * @param {number} frame_dur_sec Frame duration of PCM of callback argument
   * @param {string} processor_path File path of `RawMicCaptureProcessor` defined module
   */
  async start_capture(sample_rate, frame_dur_sec, processor_path) {
    const audio_ctx = new AudioContext({sampleRate: sample_rate});

    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
    const source_node = audio_ctx.createMediaStreamSource(stream);

    await audio_ctx.audioWorklet.addModule(processor_path);
    const capture_node = new AudioWorkletNode(audio_ctx, "raw-mic-capture-processor");

    capture_node.parameters.get("frame_sample_len").value = Math.floor(sample_rate * frame_dur_sec);

    capture_node.port.start();
    capture_node.port.addEventListener("message", e => {
      this.dispatchEvent(new MessageEvent("frame-ready", {data: e.data}));
    });

    source_node.connect(capture_node);
  }
}
