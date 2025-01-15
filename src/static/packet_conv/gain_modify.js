/**
 * @file Encoding/decoding functions for `gain_modify` packet
 *
 * More detail of packet protocol, see `packet-protocol.md`
 *
 * @author aKuad
 */

import { typeof_detail } from "../util/typeof_detail.js";


/**
 * Packet type ID of gain modify packet
 */
export const GAIN_MODIFY_PACKET_TYPE_ID = 0x20;


/**
 * Create gain_modify packet
 *
 * @param {number} lane_id Lane ID to control
 * @param {number} modified_gain_db Modified gain value
 * @returns {Uint8Array} Encoded packet
 *
 * @throws {TypeError} If `lane_id` is not `number`
 * @throws {TypeError} If `modified_gain_db` is not `number`
 * @throws {RangeError} If `lane_id` is over 80
 * @throws {RangeError} If `modified_gain_db` is not in -80~80
 */
export function packet_gain_modify_encode(lane_id, modified_gain_db) {
  // Arguments type checking
  if(typeof lane_id !== "number") {
    throw new TypeError(`lane_id must be number, but got ${typeof_detail(lane_id)}`);
  }
  if(typeof modified_gain_db !== "number") {
    throw new TypeError(`modified_gain_db must be number, but got ${typeof_detail(modified_gain_db)}`);
  }

  // Arguments range checking
  if(lane_id < 0 || lane_id > 255) {
    throw new RangeError(`lane_id must be in 0~255, but got ${lane_id}`);
  }
  if(modified_gain_db > 80) {
    throw new RangeError(`modified_gain_db must be under or equal 80, but got ${modified_gain_db}`);
  }

  const modified_gain_db_adj = modified_gain_db < -80 ? -80 : modified_gain_db; // under -80 adjust to -80
  const modified_gain_db_uint8t = (modified_gain_db_adj + 80) / 160 * 255;  // scale conversion from float [-80, 80] to 8bit
  //         [-80, 80]
  // +80  -> [0, 160]
  // /160 -> [0, 1]
  // *255 -> [0, 255]

  return Uint8Array.of(GAIN_MODIFY_PACKET_TYPE_ID, lane_id, modified_gain_db_uint8t);
}


/**
 * Data structure of decoded gain_modify packet
 *
 * @typedef {Object} GainModify
 * @property {number} lane_id Lane ID to control
 * @property {number} modified_gain_db Modified gain value
 */

/**
 * Unpack gain_modify packet
 *
 * Note: About raises, see reference of `is_gain_modify_packet`.
 *
 * @param {Uint8Array} raw_packet Encoded packet
 * @returns {GainModify} Decoded data
 */
export function packet_gain_modify_decode(raw_packet) {
  is_gain_modify_packet(raw_packet, true);

  const modified_gain_db = (raw_packet[2] / 255 * 160) - 80;  // scale conversion from 8bit to float [-80, 80]
  //         [0, 255]
  // /255 -> [0, 1]
  // *160 -> [0, 160]
  // -80  -> [-80, 80]

  return {lane_id: raw_packet[1], modified_gain_db: modified_gain_db};
}


/**
 * Verify the packet is gain_modify packet
 *
 * @param {Uint8Array} raw_packet Packet to verify
 * @param {boolean} throw_on_invalid Toggle behavior when packet is invalid, true: raise exception, false: return false
 * @returns {boolean} It is a gain_modify packet: true, otherwise: false (if throw_on_invalid === true, error will be thrown)
 *
 * @throws {TypeError} If `raw_packet` is not `Uint8Array`
 * @throws {RangeError} If `raw_packet` is an empty array
 * @throws {RangeError} If `raw_packet` has not an gain_modify packet type ID
 * @throws {RangeError} If `raw_packet` is too short bytes as gain_modify packet
 * @throws {RangeError} If `raw_packet` is too short long as gain_modify packet
 */
export function is_gain_modify_packet(raw_packet, throw_on_invalid = false) {
  try {
    // Arguments type checking
    if(!(raw_packet instanceof Uint8Array)) {
      throw new TypeError(`raw_packet must be Uint8Array, but got ${typeof_detail(raw_packet)}`);
    }

    // Packet content availability checking
    if(raw_packet.length === 0) {
      throw new RangeError("Empty array passed");
    }

    if(raw_packet[0] !== GAIN_MODIFY_PACKET_TYPE_ID) {
      throw new RangeError(`It has not a gain_modify packet type ID - should be ${GAIN_MODIFY_PACKET_TYPE_ID}, but got ${raw_packet[0]}`);
    }

    if(raw_packet.length < 3) {
      throw new RangeError(`Too short bytes as gain modify packet - expected 3, but got ${raw_packet.length}`);
    }
    if(raw_packet.length > 3) {
      throw new RangeError(`Too long bytes as gain modify packet - expected 3, but got ${raw_packet.length}`);
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
