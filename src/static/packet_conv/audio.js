/**
 * @file Encoding/decoding functions for audio packet
 *
 * More detail of packet protocol, see `designs/packet-protocol.md`
 *
 * Note: It tested only for monaural audio, multi channels is unsupported.
 *
 * @author aKuad
 */

import { ONE_FRAME_SAMPLES, ONE_SAMPLE_BYTES } from "../AUDIO_PARAM.js";
import { int16_to_uint8_little_endian, uint8_to_int16_little_endian } from "../util/int16bytes_conv.js";
import { dbfs_float } from "../util/dbfs.js";
import { typeof_detail } from "../util/typeof_detail.js";


/**
 * Packet type ID of audio packet
 */
export const AUDIO_PACKET_TYPE_ID = 0x10;


/**
 * Packet type ID of silent audio packet
 */
export const SILENT_AUDIO_PACKET_TYPE_ID = 0x11;


/**
 * Create audio packet
 *
 * @param {Float32Array} audio_pcm Audio PCM
 * @param {string} lane_name Lane name of view in mixer-client
 * @param {Uint8Array} ext_bytes User's custom external data
 * @param {number} silent_threshold_dbfs Under this dBFS input will be ignored
 * @returns {Uint8Array} Encoded packet
 *
 * @throws {TypeError} If `audio_pcm` is not `Float32Array`
 * @throws {TypeError} If `lane_name` is not `string`
 * @throws {TypeError} If `ext_bytes` is not `Uint8Array`
 * @throws {TypeError} If `silent_threshold_dbfs` is not `number`
 * @throws {RangeError} If `lane_name` is empty `string`
 * @throws {RangeError} If `lane_name` has non ascii or control ascii characters
 * @throws {RangeError} If `lane_name` has over 3 characters
 * @throws {RangeError} If `ext_bytes` has over 255 bytes
 * @throws {RangeError} If `silent_threshold_dbfs` is positive value
 */
export function packet_audio_encode(audio_pcm, lane_name, ext_bytes = new Uint8Array(0), silent_threshold_dbfs = -Infinity) {
  // Arguments type checking
  if(!(audio_pcm instanceof Float32Array)) {
    throw new TypeError(`audio_pcm must be Float32Array, but got ${typeof_detail(audio_pcm)}`);
  }
  if(typeof lane_name !== "string") {
    throw new TypeError(`lane_name must be string, but got ${typeof_detail(lane_name)}`);
  }
  if(!(ext_bytes instanceof Uint8Array)) {
    throw new TypeError(`ext_bytes must be Uint8Array, but got ${typeof_detail(ext_bytes)}`);
  }
  if(typeof silent_threshold_dbfs !== "number") {
    throw new TypeError(`silent_threshold_dbfs must be number, but got ${typeof_detail(silent_threshold_dbfs)}`);
  }

  // Arguments range checking
  if(lane_name.length === 0) {
    throw new RangeError("lane_name can't be empty string");
  }
  if(!(/^[\x20-\x7F]*$/.test(lane_name))) {
    throw new RangeError("For lane_name, non ascii or control ascii characters are not allowed");
  }
  if(lane_name.length > 3) {
    throw new RangeError(`For lane_name, over 3 characters string is not allowed, but got ${lane_name.length} characters`);
  }
  if(ext_bytes.length > 255) {
    throw new RangeError(`For ext_bytes, over 255 bytes data is not allowed, but got ${ext_bytes.length} bytes`);
  }
  if(silent_threshold_dbfs > 0) {
    throw new RangeError(`silent_threshold_dbfs must be 0 or negative value, but got ${silent_threshold_dbfs}`);
  }

  const audio_data_int16t = Int16Array.from(audio_pcm, e => e*32767); // *32767: float32(-1, 1) to int16(-32768, 32767)
  const audio_data_uint8t = int16_to_uint8_little_endian(audio_data_int16t);

  const lane_name_adj3 = (lane_name + "   ").slice(0, 3);
  const text_encoder = new TextEncoder();
  const lane_name_uint8t = text_encoder.encode(lane_name_adj3);

  if(dbfs_float(audio_pcm) <= silent_threshold_dbfs) {
    return Uint8Array.of(SILENT_AUDIO_PACKET_TYPE_ID, ...lane_name_uint8t, ext_bytes.length, ...ext_bytes);
  } else {
    return Uint8Array.of(AUDIO_PACKET_TYPE_ID, ...lane_name_uint8t, ext_bytes.length, ...ext_bytes, ...audio_data_uint8t);
  }
}


/**
 * Data structure of decoded audio packet
 *
 * @typedef {Object} AudioData
 * @property {Float32Array} audio_pcm Audio PCM
 * @property {string} lane_name Lane name of view in mixer-client
 * @property {Uint8Array} ext_bytes User's custom external data
 */

/**
 * Unpack audio packet
 *
 * Note: About raises, see reference of `is_audio_packet`.
 *
 * @param {Uint8Array} raw_packet Encoded packet
 * @returns {AudioData} Decoded data - Audio PCM, lane name and external data
 */
export function packet_audio_decode(raw_packet) {
  is_audio_packet(raw_packet, true);

  const lane_name_uint8t = raw_packet.slice(1, 4);
  const text_decoder = new TextDecoder();
  const lane_name = text_decoder.decode(lane_name_uint8t);

  const ext_bytes_len = raw_packet[4];
  const ext_bytes = raw_packet.slice(5, 5 + ext_bytes_len); // +1 for length byte\

  if(raw_packet[0] == SILENT_AUDIO_PACKET_TYPE_ID) {
    const audio_data_float32t = new Float32Array(ONE_FRAME_SAMPLES);
    return {audio_pcm: audio_data_float32t, lane_name: lane_name, ext_bytes: ext_bytes};
  } else {
    const audio_data_uint8t = raw_packet.slice(5 + ext_bytes_len);
    const audio_data_int16t = uint8_to_int16_little_endian(audio_data_uint8t);
    const audio_data_float32t = Float32Array.from(audio_data_int16t, e => e/32767); // /32767: int16(-32768, 32767) to float32(-1, 1)
    return {audio_pcm: audio_data_float32t, lane_name: lane_name, ext_bytes: ext_bytes};
  }
}


/**
 * Verify the packet is audio packet
 *
 * @param {Uint8Array} raw_packet Packet to verify
 * @param {boolean} throw_on_invalid Toggle behavior if packet is invalid, true: raise exception, false: return false
 * @returns {boolean} It is an audio packet: true, otherwise: false (if throw_on_invalid === true, error will be thrown)
 *
 * @throws {TypeError} If `raw_packet` is not `Uint8Array`
 * @throws {RangeError} If `raw_packet` is an empty array
 * @throws {RangeError} If `raw_packet` has not an audio packet or silent audio packet type ID
 * @throws {RangeError} If `raw_packet` is too short bytes as audio packet
 * @throws {RangeError} If `raw_packet` is too long bytes as audio packet
 * @throws {RangeError} If `raw_packet` is too long bytes as silent audio packet
 */
export function is_audio_packet(raw_packet, throw_on_invalid = false) {
  try {
    // Arguments type checking
    if(!(raw_packet instanceof Uint8Array)) {
      throw new TypeError(`raw_packet must be Uint8Array, but got ${typeof_detail(raw_packet)}`);
    }

    // Packet content availability checking
    if(raw_packet.length === 0) {
      throw new RangeError("Empty array passed");
    }

    // Packet type ID checking
    if(raw_packet[0] !== AUDIO_PACKET_TYPE_ID && raw_packet[0] !== SILENT_AUDIO_PACKET_TYPE_ID) {
      throw new RangeError(`It has not an audio packet or silent audio packet type ID - should be ${AUDIO_PACKET_TYPE_ID} or ${SILENT_AUDIO_PACKET_TYPE_ID}, but got ${raw_packet[0]}`);
    }

    // Packet length checking
    if(raw_packet.length < 5) {
      throw new RangeError("Too short bytes received, external bytes length field missing");
    }

    // Packet length checking (for [non]silent pattern)
    if(raw_packet[0] === AUDIO_PACKET_TYPE_ID) {
      const EXPECTED_LENGTH = 5 + raw_packet[4] + ONE_FRAME_SAMPLES * ONE_SAMPLE_BYTES;
      if       (raw_packet.length < EXPECTED_LENGTH) {
        throw new RangeError(`Too short bytes as audio packet - expected ${EXPECTED_LENGTH}, but got ${raw_packet.length}`);
      } else if(raw_packet.length > EXPECTED_LENGTH) {
        throw new RangeError(`Too long bytes as audio packet - expected ${EXPECTED_LENGTH}, but got ${raw_packet.length}`);
      }
    } else if(raw_packet[0] === SILENT_AUDIO_PACKET_TYPE_ID) {
      const EXPECTED_LENGTH = 5 + raw_packet[4];
      // // Error of RangeError("Too short bytes as silent audio packet") will be matched as
      // //          RangeError("Too short bytes received, external bytes length missing")
      // if        (raw_packet.length < EXPECTED_LENGTH) {
      //   throw new RangeError("Too short bytes as silent audio packet");
      // }
      if (raw_packet.length > EXPECTED_LENGTH) {
        throw new RangeError(`Too long bytes as silent audio packet - expected ${EXPECTED_LENGTH}, but got ${raw_packet.length}`);
      }
    }
  } catch(e) {
    if(throw_on_invalid) {
      throw e;
    } else {
      return false;
    }
  }

  return true;
}
