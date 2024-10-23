/**
 * @file Play audio from raw float array stream
 *
 * @author aKuad
 */

export class RawAudioStreamPlay {
  /**
   * Audio context instance (Web Audio API) for audio controlling
   *
   * @type {AudioContext}
   */
  #audio_ctx;

  /**
   * Sample rate [Hz] of input audio data
   *
   * @type {number}
   */
  #SAMPLE_RATE;

  /**
   * Delay of audio playing, for buffer network-lag
   *
   * @type {number}
   */
  #PLAY_DELAY_SEC;

  /**
   * Maximum duration to play reserving, for prevent too long input-play lag
   *
   * @type {number}
   */
  #MAX_QUEUE_SEC;

  /**
   * End time of playing queue, 0.0 means not played yet
   *
   * @type {number}
   */
  #next_play_time = 0.0;


  /**
   * Play audion from raw float array
   *
   * @param {number} sample_rate Sample rate of audio data to input
   * @param {number} delay_sec Delay of audio playing, for buffer network-lag
   * @param {number} max_queue_sec Maximum duration to play reserving, for prevent too long input-play lag
   */
  constructor(sample_rate, delay_sec, max_queue_sec) {
    this.#SAMPLE_RATE = sample_rate;
    this.#PLAY_DELAY_SEC = delay_sec;
    this.#MAX_QUEUE_SEC = max_queue_sec;
    this.#audio_ctx = new AudioContext({sampleRate: this.#SAMPLE_RATE});
  }


  /**
   * Start playing (or enqueue to play) raw audio
   *
   * Note:
   *   It supports only monaural audio.
   *   When play queue is full, input audio will be dropped.
   *
   * @param {Float32Array} raw_data Raw audio data to play
   */
  play(raw_data) {
    // First play or it was in long idle
    if(this.#next_play_time < this.#audio_ctx.currentTime) {
      this.#next_play_time = this.#audio_ctx.currentTime + this.#PLAY_DELAY_SEC;
    }

    // Queue is full
    if(this.#next_play_time - this.#audio_ctx.currentTime > this.#MAX_QUEUE_SEC) {
      return;
    }

    // Reserve to play audio
    const buffer_node = this.#audio_ctx.createBufferSource();
    const buffer = this.#audio_ctx.createBuffer(1, raw_data.length, this.#SAMPLE_RATE);
    buffer.copyToChannel(raw_data, 0);
    buffer_node.buffer = buffer;

    buffer_node.connect(this.#audio_ctx.destination);
    buffer_node.start(this.#next_play_time);

    buffer_node.addEventListener("ended", () => {
      buffer_node.stop();
      buffer_node.disconnect();
    });

    // Next play timing update
    this.#next_play_time += buffer_node.buffer.duration;
  }
}
