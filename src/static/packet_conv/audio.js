/**
 * @file Encoding/decoding functions for audio packet
 *
 * More detail of packet protocol, see `designs/packet-protocol.md`
 *
 * Note: It tested only for monaural audio, multi channels is unsupported.
 *
 * @author aKuad
 */

/**
 * Packet type ID of audio packet
 */
export const AUDIO_PACKET_TYPE_ID = 0x10;


/**
 * Create audio packet
 *
 * @param {Float32Array} audio_pcm Audio PCM
 * @param {string} lane_name Lane name of view in mixer-client
 * @param {Uint8Array} ext_bytes User's custom external data
 * @returns {Uint8Array} Encoded packet
 *
 * @throws {TypeError} If `audio_pcm` is not `Float32Array`
 * @throws {TypeError} If `lane_name` is not `string`
 * @throws {TypeError} If `ext_bytes` is not `Uint8Array`
 * @throws {RangeError} If ``lane_name`` has non ascii
 * @throws {RangeError} If ``lane_name`` has over 3 characters
 * @throws {RangeError} If ``ext_bytes`` has over 255 bytes
 */
export function packet_audio_encode(audio_pcm, lane_name, ext_bytes = new Uint8Array(0)) {
  // Arguments type checking
  if(!(audio_pcm instanceof Float32Array)) {
    throw new TypeError("audio_pcm must be Float32Array");
  }
  if(typeof lane_name !== "string") {
    throw new TypeError("lane_name must be string");
  }
  if(!(ext_bytes instanceof Uint8Array)) {
    throw new TypeError("ext_bytes must be Uint8Array");
  }

  // Arguments range checking
  if(!(/^[\x00-\x7F]*$/.test(lane_name))) {
    throw new RangeError("For lane_name, non ascii characters are not allowed");
  }
  if(lane_name.length > 3) {
    throw new RangeError("For lane_name, over 3 characters string is not allowed");
  }
  if(ext_bytes.length > 255) {
    throw new RangeError("For ext_bytes, over 255 bytes data is not allowed");
  }

  const audio_data_int16t = Int16Array.from(audio_pcm, e => e*32767); // *32767: float32(-1, 1) to int16(-32768, 32767)
  const audio_data_uint8t = new Uint8Array(audio_data_int16t.buffer);

  const lane_name_adj3 = (lane_name + "   ").slice(0, 3);
  const text_encoder = new TextEncoder();
  const lane_name_uint8t = text_encoder.encode(lane_name_adj3);

  return Uint8Array.of(AUDIO_PACKET_TYPE_ID, ...lane_name_uint8t, ext_bytes.length, ...ext_bytes, ...audio_data_uint8t);
}


/**
 * Unpack audio packet
 *
 * @param {Uint8Array} raw_packet Encoded packet
 * @returns {Array<Float32Array | string | Uint8Array>} Decoded data - Audio PCM, lane name and external data
 *
 * @throws {TypeError} If `raw_packet` is not `Uint8Array`
 * @throws {RangeError} If `raw_packet` is an empty array
 * @throws {RangeError} If `raw_packet` type ID bytes is not audio packet type ID
 * @throws {RangeError} If `raw_packet` is too short (external bytes info is missing)
 */
export function packet_audio_decode(raw_packet) {
  // Packet type verification
  if(!is_audio_packet(raw_packet)) {
    throw new RangeError("Invalid packet, it is not an audio packet");
  }

  // Arguments range checking
  if(raw_packet.length < 5) {
    throw new RangeError("Invalid packet, too short bytes received");
  }

  const lane_name_uint8t = raw_packet.slice(1, 4);
  const text_decoder = new TextDecoder();
  const lane_name = text_decoder.decode(lane_name_uint8t);

  const ext_data_len = raw_packet[4];
  const ext_data = raw_packet.slice(5, 5 + ext_data_len); // +1 for length byte\

  const audio_data_uint8t = raw_packet.slice(5 + ext_data_len);
  const audio_data_int16t = new Int16Array(audio_data_uint8t.buffer);
  const audio_data_float32t = Float32Array.from(audio_data_int16t, e => e/32767); // /32767: int16(-32768, 32767) to float32(-1, 1)

  return [audio_data_float32t, lane_name, ext_data];
}


/**
 * Verify the packet is audio packet
 *
 * Note: It verify only type and packet ID. Packet structure will not be verified.
 *
 * @param {Uint8Array} raw_packet Packet to verify
 * @returns {boolean} It is an audio packet: true, otherwise: false
 *
 * @throws {TypeError} If `raw_packet` is not `Uint8Array`
 * @throws {RangeError} If `raw_packet` is an empty array
 */
export function is_audio_packet(raw_packet) {
  // Arguments type checking
  if(!(raw_packet instanceof Uint8Array)) {
    throw new TypeError("raw_packet must be Uint8Array");
  }

  // Packet content availability checking
  if(raw_packet.length === 0) {
    throw new RangeError("Empty array passed");
  }

  if(raw_packet[0] === AUDIO_PACKET_TYPE_ID)
    return true;
  else
    return false;
}
