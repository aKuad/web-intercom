/**
 * @file dBFS calculating function
 *
 * @author aKuad
 */

import { typeof_detail } from "../util/typeof_detail.js";


/**
 * Calculate dBFS from float array
 *
 * Note: It supports -1.0 ~ 1.0 amplitude array. Out of this range will be thrown error.
 *
 * @param {Float32Array | Float64Array} frame_array Audio PCM frame array
 * @returns {number} dBFS value
 *
 * @throws {TypeError} If `frame_array` is not `Float32Array` or `Float64Array`
 * @throws {RangeError} If `frame_array` is empty array
 * @throws {RangeError} If `frame_array` has over 1.0 or under -1.0 elements
 */
export function dbfs_float(frame_array) {
  // Arguments type checking
  if(!(frame_array instanceof Float32Array) &&
     !(frame_array instanceof Float64Array)) {
    throw new TypeError(`frame_array must be Float32Array or Float64Array, but got ${typeof_detail(frame_array)}`);
  }

  // Content availability checking
  if(frame_array.length === 0) {
    throw new RangeError("Empty array passed");
  }

  // Arguments range checking
  if(frame_array.filter(e => e < -1.0 || e > 1.0).length) {
    throw new RangeError("Out of range elements included, must be -1.0 ~ 1.0");
  }

  const AMPLITUDE_HIGH = 1.0;

  const sq_sum = frame_array.reduce((prev, current) => prev + current**2);
  const rms = Math.sqrt(sq_sum / frame_array.length);

  return 20 * Math.log10(rms / AMPLITUDE_HIGH);
}


// For int8, int16, int32 and int64 is unimplemented.
// It will be implemented if it required.
// export function dbfs_int(frame_array) {}
