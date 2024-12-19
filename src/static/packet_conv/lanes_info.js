/**
 * @file Encoding/decoding functions for lanes-info packet
 *
 * @author aKuad
 */

import { typeof_detail } from "../util/typeof_detail.js";
import { LaneInfo } from "./LaneInfo.js";


/**
 * Packet type ID of lanes-info packet
 */
export const LANES_INFO_PACKET_TYPE_ID = 0x30;


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
 * Note: It won't check lane_name field contain non-ascii or control-ascii characters
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
