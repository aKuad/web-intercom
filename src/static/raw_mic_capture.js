/**
 * @file Module for PCM fetching from mic
 *
 * Note: It supports only mixed to monaural output
 *
 * @author aKuad
 */

import { SAMPLE_RATE } from "./packet_conv/AUDIO_PARAM.js"


/**
 * @callback on_frame_ready Callback when sample buffer reached to specified frame length
 * @param {Array<number>} pcm Fetched PCM array at float
 */

/**
 * Start PCM fetching from mic with callback function
 *
 * @param {on_frame_ready} frame_ready_callback Function for process fetched PCM
 * @param {number} frame_dur_sec Frame duration of callback's argument
 * @param {string} processor_path File path of `RawMicCaptureProcessor` defined module
 */
export async function raw_mic_capture(frame_ready_callback, frame_dur_sec, processor_path) {
  const audio_ctx = new AudioContext({sampleRate: SAMPLE_RATE});

  const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
  const source_node = audio_ctx.createMediaStreamSource(stream);

  await audio_ctx.audioWorklet.addModule(processor_path);
  const capture_node = new AudioWorkletNode(audio_ctx, "raw-mic-capture-processor");

  capture_node.parameters.get("frame_sample_len").value = Math.floor(SAMPLE_RATE * frame_dur_sec);

  capture_node.port.start();
  capture_node.port.addEventListener("message", e => {
    frame_ready_callback(e.data);
  });

  source_node.connect(capture_node);
}
