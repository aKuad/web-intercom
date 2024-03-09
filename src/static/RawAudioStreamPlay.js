/**
 * @file Play audion from raw float array stream
 *
 * @author aKuad
 */

class RawAudioStreamPlay {
  /**
   * @type {AudioContext}
   */
  #audio_ctx;

  /**
   * @type {number}
   */
  #SAMPLE_RATE = 44100;


  /**
   * Play audion from raw float array
   *
   * @param {number} sample_rate Sample rate of audio data to input
   */
  constructor(sample_rate) {
    this.#SAMPLE_RATE = sample_rate;
    this.#audio_ctx = new AudioContext({sampleRate: this.#SAMPLE_RATE});
  }


  /**
   * Start playing (or enqueue to play) raw audio
   *
   * Note:
   *   It supports only monaural audio.
   *
   * @param {Float32Array} raw_data Raw audio data to play
   */
  play(raw_data) {
    const buffer_node = this.#audio_ctx.createBufferSource();
    buffer_node.buffer = this.#audio_ctx.createBuffer(1, raw_data.length, this.#SAMPLE_RATE);
    buffer_node.connect(this.#audio_ctx.destination);

    buffer_node.buffer.copyToChannel(raw_data, 0);
    buffer_node.start();

    buffer_node.addEventListener("ended", () => {
      buffer_node.stop();
      buffer_node.disconnect()
    });
  }
}
