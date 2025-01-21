/**
 * @file Encoding/decoding functions for lane-modified packet
 *
 * @author aKuad
 */

import { typeof_detail } from "../util/typeof_detail.js";
import { LaneInfo } from "./LaneInfo.js";


/**
 * Packet type ID of lane-modified packet
 */
export const LANE_MODIFIED_PACKET_TYPE_ID = 0x32;


/**
 * Create lane-modified packet
 *
 * @param {LaneInfo} lane_info LaneInfo to encode
 * @returns {Uint8Array} Encoded packet
 *
 * @throws {TypeError} If `lane_modified` is not `LaneInfo`
 */
export function packet_lane_modified_encode(lane_info) {
  // Arguments type checking
  if(!(lane_info instanceof LaneInfo)) {
    throw new TypeError(`lane_info must be LaneInfo, but got ${typeof_detail(lane_info)}`);
  }

  return Uint8Array.of(LANE_MODIFIED_PACKET_TYPE_ID, ...lane_info.to_bytes());
}


/**
 * Unpack lane-modified packet
 *
 * Note: About raises, see reference of `is_lane_modified_packet`.
 *
 * @param {Uint8Array} raw_packet Encoded packet
 * @returns {LaneInfo} Decoded data - Lane ID, lane name, current volume
 */
export function packet_lane_modified_decode(raw_packet) {
  is_lane_modified_packet(raw_packet, true);

  return LaneInfo.from_bytes(raw_packet.slice(1));
}


/**
 * Verify the packet is lane_modified packet
 *
 * Note: It won't check lane_name field contain non-ascii or control-ascii characters
 *
 * @param {Uint8Array} raw_packet Packet to verify
 * @param {boolean} throw_on_invalid Toggle behavior when packet is invalid, true: raise exception, false: return false
 * @returns {boolean} It is an lane_modified: true, otherwise: false (if throw_on_invalid === true, error will be thrown)
 *
 * @throws {TypeError} If `raw_packet` is not `Uint8Array`
 * @throws {RangeError} If `raw_packet` is an empty array
 * @throws {RangeError} If `raw_packet` has not an lane_modified packet type ID
 * @throws {RangeError} If `raw_packet` is invalid length as lane_modified
 */
export function is_lane_modified_packet(raw_packet, throw_on_invalid = false) {
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
    if(raw_packet[0] !== LANE_MODIFIED_PACKET_TYPE_ID) {
      throw new RangeError(`It has not an lane_modified packet type ID - should be ${LANE_MODIFIED_PACKET_TYPE_ID}, but got ${raw_packet[0]}`);
    }

    // Packet length checking
    if(raw_packet.length < 6) {
      throw new RangeError(`Too short bytes as lane modified packet - expected 6, but got ${raw_packet.length}`);
    }
    if(raw_packet.length > 6) {
      throw new RangeError(`Too long bytes as lane modified packet - expected 6, but got ${raw_packet.length}`);
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
