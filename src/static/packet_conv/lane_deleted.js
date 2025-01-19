/**
 * @file Encoding/decoding functions for `lane_deleted` packet
 *
 * More detail of packet protocol, see `packet-protocol.md`
 *
 * @author aKuad
 */

import { typeof_detail } from "../util/typeof_detail.js";


/**
 * Packet type ID of gain modify packet
 */
export const LANE_DELETED_PACKET_TYPE_ID = 0x33;


/**
 * Create lane_deleted packet
 *
 * @param {number} lane_id Lane ID of deleted
 * @returns {Uint8Array} Encoded packet
 *
 * @throws {TypeError} If `lane_id` is not `number`
 * @throws {RangeError} If `lane_id` is not in -80~80
 */
export function packet_lane_deleted_encode(lane_id) {
  // Arguments type checking
  if(typeof lane_id !== "number") {
    throw new TypeError(`lane_id must be number, but got ${typeof_detail(lane_id)}`);
  }

  // Arguments range checking
  if(lane_id < 0 || lane_id > 255) {
    throw new RangeError(`lane_id must be in 0~255, but got ${lane_id}`);
  }

  return Uint8Array.of(LANE_DELETED_PACKET_TYPE_ID, lane_id);
}


/**
 * Data structure of decoded lane_deleted packet
 *
 * @typedef {Object} GainModify
 * @property {number} lane_id Lane ID of deleted
 */

/**
 * Unpack lane_deleted packet
 *
 * Note: About raises, see reference of `is_lane_deleted_packet`.
 *
 * @param {Uint8Array} raw_packet Encoded packet
 * @returns {GainModify} Decoded data
 */
export function packet_lane_deleted_decode(raw_packet) {
  is_lane_deleted_packet(raw_packet, true);

  return {lane_id: raw_packet[1]};
}


/**
 * Verify the packet is lane_deleted packet
 *
 * @param {Uint8Array} raw_packet Packet to verify
 * @param {boolean} throw_on_invalid Toggle behavior when packet is invalid, true: raise exception, false: return false
 * @returns {boolean} It is a lane_deleted packet: true, otherwise: false (if throw_on_invalid === true, error will be thrown)
 *
 * @throws {TypeError} If `raw_packet` is not `Uint8Array`
 * @throws {RangeError} If `raw_packet` is an empty array
 * @throws {RangeError} If `raw_packet` has not an lane_deleted packet type ID
 * @throws {RangeError} If `raw_packet` is too long bytes as lane_deleted packet
 */
export function is_lane_deleted_packet(raw_packet, throw_on_invalid = false) {
  try {
    // Arguments type checking
    if(!(raw_packet instanceof Uint8Array)) {
      throw new TypeError(`raw_packet must be Uint8Array, but got ${typeof_detail(raw_packet)}`);
    }

    // Packet content availability checking
    if(raw_packet.length === 0) {
      throw new RangeError("Empty array passed");
    }

    if(raw_packet[0] !== LANE_DELETED_PACKET_TYPE_ID) {
      throw new RangeError(`It has not a lane_deleted packet type ID - should be ${LANE_DELETED_PACKET_TYPE_ID}, but got ${raw_packet[0]}`);
    }

    if(raw_packet.length < 2) {
      throw new RangeError(`Too short bytes as lane deleted packet - expected 2, but got ${raw_packet.length}`);
    }
    if(raw_packet.length > 2) {
      throw new RangeError(`Too long bytes as lane deleted packet - expected 2, but got ${raw_packet.length}`);
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
