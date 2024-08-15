/**
 * @file Tests for `dbfs.js` module
 *
 * Test cases:
 *   * Can calculate dBFS from `Float32Array`, test by comparing loud pcm and quiet pcm
 *   * Throw TypeError if invalid argument type is passed
 *   * Throw RangeError if empty array is passed
 *   * Throw RangeError if non -1.0~1.0 range array is passed
 *
 * Test steps:
 *   * Run this script by vitest - `npm test`
 *
 * @author aKuad
 */

import { assertEquals, assertThrows, assertGreater } from "jsr:@std/assert@1";

import { ONE_FRAME_SAMPLES } from "../../static/packet_conv/AUDIO_PARAM.js";
import { dbfs_float } from "../../static/dbfs.js";
import { generate_rand_float32array } from "./util/rand_f32a.js";


Deno.test(async function true_cases(t) {
  await t.step(function float() {
    const pcm_loud  = generate_rand_float32array(ONE_FRAME_SAMPLES);
    const pcm_quiet = pcm_loud.map(e => e * 0.1);  // Apply gain -20[dB] = 10 ** (-20/20) = 0.1

    const dbfs_loud  = dbfs_float(pcm_loud);
    const dbfs_quiet = dbfs_float(pcm_quiet);

    console.log(`Loud : ${dbfs_loud} dBFS`);
    console.log(`Quiet: ${dbfs_quiet} dBFS`);
    assertGreater(dbfs_loud, dbfs_quiet);
  });
});


Deno.test(async function err_cases(t) {
  await t.step(function float_invalid_type() {
    assertThrows(() => dbfs_float(), TypeError, "frame_array must be Float32Array or Float64Array");
  });


  await t.step(function float_invalid_value() {
    const pcm_invalid_empty = new Float32Array();
    const pcm_invalid_too_high_amp = new Float32Array([0.0,  1.1, 0.0]);
    const pcm_invalid_too_low_amp  = new Float32Array([0.0, -1.1, 0.0]);

    assertThrows(() => dbfs_float(pcm_invalid_empty)       , RangeError, "Empty array passed");
    assertThrows(() => dbfs_float(pcm_invalid_too_high_amp), RangeError, "Out of range elements included, must be -1.0 ~ 1.0");
    assertThrows(() => dbfs_float(pcm_invalid_too_low_amp ), RangeError, "Out of range elements included, must be -1.0 ~ 1.0");
  });
});
