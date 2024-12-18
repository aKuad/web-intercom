/**
 * @file Encoding/decoding functions for `volume_modify` packet
 *
 * More detail of packet protocol, see `packet-protocol.md`
 *
 * @author aKuad
 */

import { typeof_detail } from "../util/typeof_detail.js";


/**
 * Packet type ID of volume modify packet
 */
export const VOLUME_MODIFY_PACKET_TYPE_ID = 0x20;


/**
 * Create volume_modify packet
 *
 * @param {number} lane_id Lane ID to control
 * @param {number} modified_volume Modified volume value
 * @returns {Uint8Array} Encoded packet
 *
 * @throws {TypeError} If `lane_id` is not `number`
 * @throws {TypeError} If `modified_volume` is not `number`
 * @throws {RangeError} If `lane_id` is not in 0~255
 * @throws {RangeError} If `modified_volume` is not in 0~255
 */
export function packet_volume_modify_encode(lane_id, modified_volume) {
  // Arguments type checking
  if(typeof lane_id !== "number") {
    throw new TypeError(`lane_id must be number, but got ${typeof_detail(lane_id)}`);
  }
  if(typeof modified_volume !== "number") {
    throw new TypeError(`modified_volume must be number, but got ${typeof_detail(modified_volume)}`);
  }

  // Arguments range checking
  if(lane_id < 0 || lane_id > 255) {
    throw new RangeError(`lane_id must be in 0~255, but got ${lane_id}`);
  }
  if(modified_volume < 0 || modified_volume > 255) {
    throw new RangeError(`modified_volume must be in 0~255, but got ${modified_volume}`);
  }

  return Uint8Array.of(VOLUME_MODIFY_PACKET_TYPE_ID, lane_id, modified_volume);
}


/**
 * Data structure of decoded volume_modify packet
 *
 * @typedef {Object} VolumeModify
 * @property {number} lane_id Lane ID to control
 * @property {number} modified_volume Modified volume value
 */

/**
 * Unpack volume_modify packet
 *
 * Note: About raises, see reference of `is_volume_modify_packet`.
 *
 * @param {Uint8Array} raw_packet Encoded packet
 * @returns {VolumeModify} Decoded data
 */
export function packet_volume_modify_decode(raw_packet) {
  is_volume_modify_packet(raw_packet, true);

  return {lane_id: raw_packet[1], modified_volume: raw_packet[2]};
}


/**
 * Verify the packet is volume_modify packet
 *
 * @param {Uint8Array} raw_packet Packet to verify
 * @param {boolean} throw_on_invalid Toggle behavior when packet is invalid, true: raise exception, false: return false
 * @returns {boolean} It is a volume_modify packet: true, otherwise: false (if throw_on_invalid === true, error will be thrown)
 *
 * @throws {TypeError} If `raw_packet` is not `Uint8Array`
 * @throws {RangeError} If `raw_packet` is an empty array
 * @throws {RangeError} If `raw_packet` has not an volume_modify packet type ID
 * @throws {RangeError} If `raw_packet` is too short bytes as volume_modify packet
 * @throws {RangeError} If `raw_packet` is too short long as volume_modify packet
 */
export function is_volume_modify_packet(raw_packet, throw_on_invalid = false) {
  try {
    // Arguments type checking
    if(!(raw_packet instanceof Uint8Array)) {
      throw new TypeError(`raw_packet must be Uint8Array, but got ${typeof_detail(raw_packet)}`);
    }

    // Packet content availability checking
    if(raw_packet.length === 0) {
      throw new RangeError("Empty array passed");
    }

    if(raw_packet[0] !== VOLUME_MODIFY_PACKET_TYPE_ID) {
      throw new RangeError(`It has not a volume_modify packet type ID - should be ${VOLUME_MODIFY_PACKET_TYPE_ID}, but got ${raw_packet[0]}`);
    }

    if(raw_packet.length < 3) {
      throw new RangeError(`Too short bytes as volume modify packet - expected 3, but got ${raw_packet.length}`);
    }
    if(raw_packet.length > 3) {
      throw new RangeError(`Too long bytes as volume modify packet - expected 3, but got ${raw_packet.length}`);
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
