/**
 * @file Data structure for lanes_loudness packet
 *
 * @author aKuad
 */

import { typeof_detail } from "../util/typeof_detail.js";


/**
 * Data structure for lanes_loudness packet
 */
export class LaneLoudness {
  /**
   * Data structure of a lane loudness
   *
   * @param {number} lane_id Lane ID
   * @param {number} current_dbfs Lane current loudness
   *
   * @throws {TypeError} If `lane_id` is not `number`
   * @throws {TypeError} If `current_dbfs` is not `number`
   * @throws {RangeError} If `lane_id` is not in 0~255
   * @throws {RangeError} If `current_dbfs` is positive value
   */
  constructor(lane_id, current_dbfs) {
    // Arguments type checking
    if (typeof lane_id !== "number") {
      throw new TypeError(`lane_id must be number, but got ${typeof_detail(lane_id)}`);
    }
    if (typeof current_dbfs !== "number") {
      throw new TypeError(`current_dbfs must be number, but got ${typeof_detail(current_dbfs)}`);
    }

    // Arguments range checking
    if (lane_id < 0 || lane_id > 255) {
      throw new RangeError(`lane_id must be 0~255, but got ${lane_id}`);
    }
    if (current_dbfs > 0) {
      throw new RangeError(`current_dbfs must be 0 or negative value, but got ${current_dbfs}`);
    }

    this.lane_id = lane_id;
    this.current_dbfs = current_dbfs < -80 ? -80 : current_dbfs;  // under -80 adjust to -80
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
    const current_dbfs = bytes[1] / 255 * 80 - 80;
    //         [0, 255]
    // /255 -> [0, 1]
    // *80  -> [0, 80]
    // -80  -> [-80, 0]

    return new LaneLoudness(lane_id, current_dbfs);
  }


  /**
   * Export `LaneLoudness` to bytes as a part of lane-loudness packet
   *
   * @returns {Uint8Array} Data struct in bytes as a part of lane-loudness packet
   */
  to_bytes() {
    const current_dbfs_uint8t = (this.current_dbfs + 80) / 80 * 255;
    //         [-80, 0]
    // +80  -> [0, 80]
    // /80  -> [0, 1]
    // *255 -> [0, 255]

    return Uint8Array.of(this.lane_id, current_dbfs_uint8t);
  }
}
