/**
 * @file Encoding/decoding functions for lanes-info packet
 *
 * @author aKuad
 */

import { typeof_detail } from "../typeof_detail.js";


/**
 * Packet type ID of lanes-info packet
 */
export const LANES_INFO_PACKET_TYPE_ID = 0x30;


export class LaneInfo {
  /**
   * Data structure of a lane
   *
   * @param {number} lane_id Lane ID
   * @param {string} lane_name Lane name of view in mixer-client
   * @param {number} current_volume Lane current volume
   *
   * @throws {TypeError} If `lane_id` is not `number`
   * @throws {TypeError} If `lane_name` is not `string`
   * @throws {TypeError} If `current_volume` is not `number`
   * @throws {RangeError} If `lane_id` is not in 0~255
   * @throws {RangeError} If `lane_name` is empty string
   * @throws {RangeError} If `lane_name` has non ascii or ascii control characters
   * @throws {RangeError} If `lane_name` has over 3 characters
   * @throws {RangeError} If `current_volume` is not in 0~255
   */
  constructor(lane_id, lane_name, current_volume) {
    // Arguments type checking
    if(typeof lane_id !== "number") {
      throw new TypeError(`lane_id must be number, but got ${typeof_detail(lane_id)}`);
    }
    if(typeof lane_name !== "string") {
      throw new TypeError(`lane_name must be string, but got ${typeof_detail(lane_name)}`);
    }
    if(typeof current_volume !== "number") {
      throw new TypeError(`current_volume must be number, but got ${typeof_detail(current_volume)}`);
    }

    // Arguments range checking
    if(lane_id < 0 || lane_id > 255) {
      throw new RangeError(`lane_id must be 0~255, but got ${lane_id}`);
    }
    if(!(/^[\x20-\x7F]*$/.test(lane_name))) {
      throw new RangeError("For lane_name, non ascii characters are not allowed");
    }
    if(lane_name.length === 0) {
      throw new RangeError("lane_name can't be empty string");
    }
    if(lane_name.length > 3) {
      throw new RangeError(`For lane_name, over 3 characters string is not allowed, but got ${lane_name.length} characters`);
    }
    if(current_volume < 0 || current_volume > 255) {
      throw new RangeError(`current_volume must be 0~255, but got ${current_volume}`);
    }

    this.lane_id = lane_id;
    this.lane_name = lane_name;
    this.current_volume = current_volume;
  }


  /**
   * Instantiate `LaneInfo` from bytes
   *
   * @param {Uint8Array} bytes Lane info data in bytes
   * @returns {LaneInfo} Data contained LanesInfo object
   *
   * @throws {TypeError} If `bytes` is not `Uint8Array`
   * @throws {RangeError} If `bytes` length is not 5 (1 data should be 5 bytes)
   */
  static from_bytes(bytes) {
    if(!(bytes instanceof Uint8Array)) {
      throw new TypeError(`bytes must be Uint8Array, but got ${typeof_detail(bytes)}`);
    }
    if(bytes.length != 5) {
      throw new RangeError(`bytes must be 5, but got ${bytes.length}`);
    }

    const text_decoder = new TextDecoder();

    const lane_id = bytes[0];
    const lane_name_uint8t = bytes.slice(1, 4);
    const lane_name = text_decoder.decode(lane_name_uint8t).trim();
    const current_volume = bytes[4];

    return new LaneInfo(lane_id, lane_name, current_volume);
  }


  /**
   * Export `LaneInfo` to bytes as a part of lane-info packet
   *
   * @returns {Uint8Array} Data struct in bytes as a part of lane-info packet
   */
  to_bytes() {
    const lane_name_adj3 = (this.lane_name + "   ").slice(0, 3);
    const text_encoder = new TextEncoder();
    const lane_name_uint8t = text_encoder.encode(lane_name_adj3);

    return Uint8Array.of(this.lane_id, ...lane_name_uint8t, this.current_volume);
  }
}


/**
 * Create lanes-info packet
 *
 * @param {Array<LaneInfo>} lanes_info LaneInfo array to encode
 * @returns {Uint8Array} Encoded packet
 *
 * @throws {TypeError} If `lanes_info` is not `Array`
 * @throws {RangeError} If `lanes_info` is empty array
 * @throws {TypeError} If `lanes_info` has non `LaneInfo` elements
 */
export function packet_lanes_info_encode(lanes_info) {
  // Arguments type checking
  if(!(lanes_info instanceof Array)) {
    throw new TypeError(`lanes_info must be Array, but got ${typeof_detail(lanes_info)}`);
  }
  if(lanes_info.length === 0) {
    throw new RangeError("Empty array passed");
  }
  if(lanes_info.filter(e => !(e instanceof LaneInfo)).length !== 0) {
    throw new TypeError("Non LaneInfo elements detected");
  }

  const packet_body = lanes_info.flatMap(e => Array.from(e.to_bytes()));
  return Uint8Array.of(LANES_INFO_PACKET_TYPE_ID, ...packet_body);
}


/**
 * Unpack lanes-info packet
 *
 * Note: About raises, see reference of `is_lanes_info_packet`.
 *
 * @param {Uint8Array} raw_packet Encoded packet
 * @returns {Array<LaneInfo>} Decoded data - Lane ID, lane name, current volume
 */
export function packet_lanes_info_decode(raw_packet) {
  is_lanes_info_packet(raw_packet, true);

  const lanes_info = [];

  for(let i = 1; i < raw_packet.length; i += 5) {
    lanes_info.push(LaneInfo.from_bytes(raw_packet.slice(i, i + 5)));
  }

  return lanes_info;
}


/**
 * Verify the packet is lanes_info packet
 *
 * Note: It won't check lane_name field has not non ascii or control ascii characters
 *
 * @param {Uint8Array} raw_packet Packet to verify
 * @param {boolean} throw_on_invalid Toggle behavior when packet is invalid, true: raise exception, false: return false
 * @returns {boolean} It is an lanes_info: true, otherwise: false (if throw_on_invalid === true, error will be thrown)
 *
 * @throws {TypeError} If `raw_packet` is not `Uint8Array`
 * @throws {RangeError} If `raw_packet` is an empty array
 * @throws {RangeError} If `raw_packet` has not an lanes_info packet type ID
 * @throws {RangeError} If `raw_packet` is invalid length as lanes_info
 */
export function is_lanes_info_packet(raw_packet, throw_on_invalid = false) {
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
    if(raw_packet[0] !== LANES_INFO_PACKET_TYPE_ID) {
      throw new RangeError(`It has not an lanes_info packet type ID - should be ${LANES_INFO_PACKET_TYPE_ID}, but got ${raw_packet[0]}`);
    }

    // Packet length checking
    if(((raw_packet.length - 1) % 5) !== 0) {
      throw new RangeError("Invalid length bytes as lanes_info packet, may be broken");
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
