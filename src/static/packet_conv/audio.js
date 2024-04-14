/**
 * @file Conversion functions between raw packet and external bytes & raw audio bytes
 *
 * @author aKuad
 */

/**
 * Join audio data and external data into a audio packet (Uint8Array)
 *
 * @param {Float32Array} audio_data Raw audio data
 * @param {Uint8Array} ext_data User's custom external data
 * @returns {Uint8Array} Encoded packet
 */
function packet_audio_enc(audio_data, ext_data = new Uint8Array(0)) {
  const audio_data_int16t = Int16Array.from(audio_data, e => e*32767);
  const audio_data_uint8t = new Uint8Array(audio_data_int16t.buffer);

  return Uint8Array.of(ext_data.length, ...ext_data, ...audio_data_uint8t);
}


/**
 * Divide a audio packet (Uint8Array) to audio data and external data
 *
 * @param {Uint8Array} raw_packet Encoded packet
 * @returns {Array<Uint8Array | Float32Array>} Audio data, external data
 */
function packet_audio_dec(raw_packet) {
  const ext_data_len = raw_packet[0];

  const ext_data = raw_packet.slice(1, ext_data_len + 1); // +1 for length byte

  const audio_data_uint8t = raw_packet.slice(ext_data_len + 1);
  const audio_data_int16t = new Int16Array(audio_data_uint8t.buffer);
  const audio_data_float32t = Float32Array.from(audio_data_int16t, e => e/32767);

  return [audio_data_float32t, ext_data];
}
