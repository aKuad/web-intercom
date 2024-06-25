/**
 * @file Tests for `dbfs.js` module
 *
 * Test cases:
 *   * Can encode/decode audio packet
 *   * Raise TypeError if invalid argument type is passed
 *   * Raise RangeError if invalid argument value is passed
 *
 * Test steps:
 *   * Run this script by vitest - `npm test`
 *
 * @author aKuad
 */

import { dbfs_float } from "../../static/dbfs.js"
import { describe, test, expect } from "vitest"


describe("true_cases", () => {
  test("float", () => {
    const pcm_loud  = part_testdata_rand_float32array();
    const pcm_quiet = pcm_loud.map(e => e * 0.1);  // Apply gain -20[dB] = 10 ** (-20/20) = 0.1

    const dbfs_loud  = dbfs_float(pcm_loud);
    const dbfs_quiet = dbfs_float(pcm_quiet);

    console.log(`Loud : ${dbfs_loud} dBFS`);
    console.log(`Quiet: ${dbfs_quiet} dBFS`);
    expect(dbfs_loud).toBeGreaterThan(dbfs_quiet);
  });
});


describe("err_cases", () => {
  test("float_invalid_type", () => {
    expect(() => dbfs_float()).toThrowError(new TypeError("frame_array must be Float32Array or Float64Array"));
  });


  test("float_invalid_value", () => {
    const pcm_invalid_empty = new Float32Array();
    const pcm_invalid_too_high_amp = new Float32Array([0.0,  1.1, 0.0]);
    const pcm_invalid_too_low_amp  = new Float32Array([0.0, -1.1, 0.0]);

    expect(() => dbfs_float(pcm_invalid_empty)).toThrowError(new RangeError("Empty array passed"));
    expect(() => dbfs_float(pcm_invalid_too_high_amp)).toThrowError(new RangeError("Out of range elements included, must be -1.0 ~ 1.0"));
    expect(() => dbfs_float(pcm_invalid_too_low_amp )).toThrowError(new RangeError("Out of range elements included, must be -1.0 ~ 1.0"));
  });
});


/**
 * Generate a random `Float32Array` 4410 length
 *
 * It can use for test data as random audio.
 *
 * @returns {Float32Array} Random array
 */
function part_testdata_rand_float32array() {
  return Float32Array.from(new Array(4410), e => (Math.random() - 0.5) * 2);
  // - 0.5   --> Random number range is [ -0.5, 0.5)
  // * 2     -->                        [   -1,   1)
}
