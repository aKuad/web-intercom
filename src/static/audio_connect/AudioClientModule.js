/**
 * @file High level module of audio IO and communication
 *
 * @author aKuad
 */

import { raw_mic_capture } from "./raw_mic_capture.js";
import { RawAudioStreamPlay } from "./RawAudioStreamPlay.js";
import { packet_audio_decode, packet_audio_encode } from "../packet_conv/audio.js";
import { SAMPLE_RATE, FRAME_DURATION_SEC } from "../AUDIO_PARAM.js";
import { typeof_detail } from "../typeof_detail.js";


/**
 * High level module of audio IO and communication
 */
export class AudioClientModule extends EventTarget {
  /**
   * Queue of `ext_bytes` sending
   *
   * @type {Array<Uint8Array>}
   */
  #ext_bytes_send_queue;


  /**
   * WebSocket object for communicate audio to server
   *
   * @type {WebSocket}
   */
  #web_socket;


  /**
   * PCM player (audio output)
   *
   * @type {RawAudioStreamPlay}
   */
  #audio_player;


  /**
   * Lane name to contain audio packet
   *
   * @type {string}
   */
  #lane_name;


  /**
   * Under this dBFS input will be ignored
   *
   * @type {number}
   */
  #silent_threshold_dbfs;


  /**
   * Construct with settings
   *
   * Note: Connection and communication will be started at after construction
   *
   * @param {string} api_endpoint API endpoint (URI) to connect
   * @param {string} lane_name Lane name to contain audio packet
   * @param {number} silent_threshold_dbfs Under this dBFS input will be ignored
   */
  constructor(api_endpoint, lane_name, silent_threshold_dbfs) {
    super();

    // Argument check
    //// for api_endpoint, check by WebSocket constructor
    //// for lane_name and silent_threshold_dbfs, check by encoding function
    packet_audio_encode(new Float32Array(1), lane_name, new Uint8Array(), silent_threshold_dbfs);

    // Values assignment to object members
    this.#web_socket            = new WebSocket(api_endpoint);
    this.#web_socket.binaryType = "arraybuffer";
    this.#audio_player          = new RawAudioStreamPlay(SAMPLE_RATE, FRAME_DURATION_SEC * 1, FRAME_DURATION_SEC * 3);
    this.#ext_bytes_send_queue  = [];
    this.#lane_name             = lane_name;
    this.#silent_threshold_dbfs = silent_threshold_dbfs;

    // Audio receive & playing process
    const audio_decode_play = this.#audio_decode_play.bind(this); // keep 'this' points to class
    this.#web_socket.addEventListener("message", e => audio_decode_play(new Uint8Array(e.data)));

    // Audio capture & send process
    const audio_send = this.#audio_send.bind(this); // keep 'this' points to class
    raw_mic_capture(pcm => audio_send(pcm),
                    SAMPLE_RATE,
                    FRAME_DURATION_SEC,
                    "/static/audio_connect/RawMicCaptureProcessor.js");
  }


  /**
   * Enqueue an `ext_bytes` to send buffer
   *
   * @param {Uint8Array} ext_bytes `ext_bytes` to send
   *
   * @throws {TypeError} If `ext_bytes` is not `Uint8Array`
   */
  ext_bytes_send(ext_bytes) {
    // Argument type checking
    if(!(ext_bytes instanceof Uint8Array)) {
      throw new TypeError(`ext_bytes must be Uint8Array, but got ${typeof_detail(ext_bytes)}`);
    }

    this.#ext_bytes_send_queue.push(ext_bytes);
  }


  /**
   * Audio packet encoding and sending
   *
   * @param {Array<number>} pcm PCM to send
   */
  #audio_send(pcm) {
    if(this.#web_socket.readyState !== WebSocket.OPEN) { return; }

    const next_ext_bytes = (this.#ext_bytes_send_queue.length !== 0) ? this.#ext_bytes_send_queue.shift() : new Uint8Array();

    const packet = packet_audio_encode(new Float32Array(pcm), this.#lane_name, next_ext_bytes, this.#silent_threshold_dbfs);
    this.#web_socket.send(packet);
  }


  /**
   * Dispatch on `ext_bytes` received
   *
   * @event AudioClientModule#ext-bytes-received
   * @property {Uint8Array} detail Received `ext_bytes`
   */

  /**
   * Audio packet decoding and playing
   *
   * @param {Uint8Array} packet Audio packet
   */
  #audio_decode_play(packet) {
    const [pcm,, ext_bytes] = packet_audio_decode(packet);

    this.#audio_player.play(pcm);

    if(ext_bytes.length !== 0) {
      this.dispatchEvent(new CustomEvent("ext-bytes-received", { detail: ext_bytes }));
    }
  }
}
