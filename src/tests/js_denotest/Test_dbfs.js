/**
 * @file Tests for `dbfs.js` module
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test **Test*.js`
 *
 * @author aKuad
 */

import { assertThrows, assertAlmostEquals } from "jsr:@std/assert@1";

import { ONE_FRAME_SAMPLES } from "../../static/AUDIO_PARAM.js";
import { dbfs_float } from "../../static/dbfs.js";
import { generate_rand_float32array } from "./util/rand_f32a.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can calculate dBFS from `Float32Array`
   *   - Test by comparing loud pcm and quiet pcm
   */
  await t.step(function float() {
    const pcm_loud  = generate_rand_float32array(ONE_FRAME_SAMPLES);
    const pcm_quiet = pcm_loud.map(e => e * 0.1);  // Apply gain -20[dB] = 10 ** (-20/20) = 0.1

    const dbfs_loud  = dbfs_float(pcm_loud);
    const dbfs_quiet = dbfs_float(pcm_quiet);

    console.log(`Loud : ${dbfs_loud} dBFS`);
    console.log(`Quiet: ${dbfs_quiet} dBFS`);
    assertAlmostEquals(dbfs_loud - 20.0, dbfs_quiet, 0.1);  // During calculation, error includes about 0.02
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - Argument `frame_array` must be `Float32Array` or `Float64Array`
   */
  await t.step(function float_invalid_type() {
    assertThrows(() => dbfs_float(""), TypeError, "frame_array must be Float32Array or Float64Array, but got string");
  });


  /**
   * - Argument `frame_array` must not be empty array
   * - Argument `frame_array` all array element must be in -1.0~1.0
   */
  await t.step(function float_invalid_value() {
    const pcm_invalid_empty = new Float32Array();
    const pcm_invalid_too_high_amp = new Float32Array([0.0,  1.1, 0.0]);
    const pcm_invalid_too_low_amp  = new Float32Array([0.0, -1.1, 0.0]);

    assertThrows(() => dbfs_float(pcm_invalid_empty)       , RangeError, "Empty array passed");
    assertThrows(() => dbfs_float(pcm_invalid_too_high_amp), RangeError, "Out of range elements included, must be -1.0 ~ 1.0");
    assertThrows(() => dbfs_float(pcm_invalid_too_low_amp ), RangeError, "Out of range elements included, must be -1.0 ~ 1.0");
  });
});
