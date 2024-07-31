/**
 * @file Audio worklet processor definition for `raw_mic_capture.js` module
 *
 * @author aKuad
 */

import { SAMPLE_RATE, ONE_FRAME_SAMPLES } from "./packet_conv/AUDIO_PARAM.js";


/**
 * WebAudioAPI processor definition of exporting PCM (raw audio array) from node input to node message port
 *
 * Note: It supports only mixed to monaural output
 */
class RawMicCaptureProcessor extends AudioWorkletProcessor {
  #raw_audio_buf = [];

  static get parameterDescriptors () {
    return [
      {
        name: 'frame_sample_len',
        defaultValue: ONE_FRAME_SAMPLES,
        minValue: 0,
        maxValue: SAMPLE_RATE,
      },
    ]
  }

  /**
   * Note: It supports only mixed to monaural output
   *
   * @param {Array} inputs Audio inputs
   * @param {Array} outputs Audio outputs - not used
   * @param {Array<AudioParam>} parameters Parameters input - not used
   * @returns Continue node processing or not
   */
  process(inputs, outputs, parameters) {
    // Length 0 means disabled
    const frame_len = parameters.frame_sample_len[0];
    if(frame_len == 0) {
      return true;
    }

    this.#raw_audio_buf.push(...RawMicCaptureProcessor.#audio_mix(inputs.flat(Infinity)));

    if(this.#raw_audio_buf.length >= frame_len) {
      this.port.postMessage(this.#raw_audio_buf.slice(0, frame_len));
      this.#raw_audio_buf = this.#raw_audio_buf.slice(frame_len);
    }

    return true;
  }


  /**
   * Mix raw audio arrays to one array
   *
   * @param {Array<Float32Array>} inputs Raw audio data array to mix
   * @returns {Float32Array} Mixed audio data array
   */
  static #audio_mix(inputs) {
    const output = new Float32Array(inputs[0].length);

    // Calc sum
    inputs.forEach(input => {
      for(let i = 0; i < output.length; i++) {
        output[i] += input[i];
      }
    });

    // sum to average
    for(let i = 0; i < output.length; i++) {
      output[i] /= inputs.length;
    }

    return output;
  }
}

registerProcessor("raw-mic-capture-processor", RawMicCaptureProcessor);
