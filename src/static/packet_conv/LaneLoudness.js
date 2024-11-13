/**
 * @file Data structure for lanes_loudness packet
 *
 * @author aKuad
 */

import { typeof_detail } from "../typeof_detail.js";


/**
 * Data structure for lanes_loudness packet
 */
export class LaneLoudness {
  /**
   * Data structure of a lane loudness
   *
   * @param {number} lane_id Lane ID
   * @param {number} current_loudness Lane current loudness
   *
   * @throws {TypeError} If `lane_id` is not `number`
   * @throws {TypeError} If `current_loudness` is not `number`
   * @throws {RangeError} If `lane_id` is not in 0~255
   * @throws {RangeError} If `current_loudness` is not in 0~255
   */
  constructor(lane_id, current_loudness) {
    // Arguments type checking
    if (typeof lane_id !== "number") {
      throw new TypeError(`lane_id must be number, but got ${typeof_detail(lane_id)}`);
    }
    if (typeof current_loudness !== "number") {
      throw new TypeError(`current_loudness must be number, but got ${typeof_detail(current_loudness)}`);
    }

    // Arguments range checking
    if (lane_id < 0 || lane_id > 255) {
      throw new RangeError(`lane_id must be 0~255, but got ${lane_id}`);
    }
    if (current_loudness < 0 || current_loudness > 255) {
      throw new RangeError(`current_loudness must be 0~255, but got ${current_loudness}`);
    }

    this.lane_id = lane_id;
    this.current_loudness = current_loudness;
  }


  /**
   * Instantiate `LaneLoudness` from bytes
   *
   * @param {Uint8Array} bytes Lane loudness data in bytes
   * @returns {LaneLoudness} Data contained LanesLoudness object
   *
   * @throws {TypeError} If `bytes` is not `Uint8Array`
   * @throws {RangeError} If `bytes` length is not 2 (1 data must be 2 bytes)
   */
  static from_bytes(bytes) {
    if (!(bytes instanceof Uint8Array)) {
      throw new TypeError(`bytes must be Uint8Array, but got ${typeof_detail(bytes)}`);
    }
    if (bytes.length !== 2) {
      throw new RangeError(`bytes must be 2, but got ${bytes.length}`);
    }

    const lane_id = bytes[0];
    const current_loudness = bytes[1];

    return new LaneLoudness(lane_id, current_loudness);
  }


  /**
   * Export `LaneLoudness` to bytes as a part of lane-loudness packet
   *
   * @returns {Uint8Array} Data struct in bytes as a part of lane-loudness packet
   */
  to_bytes() {
    return Uint8Array.of(this.lane_id, this.current_loudness);
  }
}
