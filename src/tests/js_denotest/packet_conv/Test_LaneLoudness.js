/**
 * @file Tests for `packet_conv/LaneLoudness.js` module
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test **Test*.js`
 *
 * @author aKuad
 */

import { assertEquals, assertAlmostEquals, assertThrows } from "jsr:@std/assert@1";

import { LaneLoudness } from "../../../static/packet_conv/LaneLoudness.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can be convert between `LaneLoudness` and bytes (`Uint8Array`)
   *   - Original object and after conversion data must be equal
   */
  await t.step(function LaneLoudness_convert_bytes() {
    const lane_loudness_org = new LaneLoudness(0, 0);
    const lane_loudness_bytes = lane_loudness_org.to_bytes();
    const lane_loudness_prc = LaneLoudness.from_bytes(lane_loudness_bytes);

    assertEquals(lane_loudness_prc, lane_loudness_org);
  });


  /**
   * - `current_dbfs` conversion error is in tolerance
   *   - During scale conversion [-80, 0] to [0, 255], 0.5 error will be 0.156862745 (= 0.5/255*80)
   */
  await t.step(function gain_conversion_error() {
    const lane_loudness_org = new LaneLoudness(0, -40);
    const lane_loudness_bytes = lane_loudness_org.to_bytes();
    const lane_loudness_prc = LaneLoudness.from_bytes(lane_loudness_bytes);

    // dbfs -40 will be converted to 127.5, but in uint8t rounds to 127, then error 0.5
    assertAlmostEquals(lane_loudness_prc.current_dbfs, lane_loudness_org.current_dbfs, 0.157);
  });


  /**
   * - Can under -80 value of `current_dbfs` adjust to -80
   */
  await t.step(function under_range_adjust() {
    const lane_loudness_neg_801 = new LaneLoudness(0, -80.1);
    const lane_loudness_neg_inf = new LaneLoudness(0, -Infinity);

    assertEquals(lane_loudness_neg_801.current_dbfs, -80);
    assertEquals(lane_loudness_neg_inf.current_dbfs, -80);
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - At `LaneLoudness` constructor, `lane_id` must be `number`
   * - At `LaneLoudness` constructor, `current_dbfs` must be `number`
   * - At `LaneLoudness` constructor, `lane_id` must be in 0~255
   * - At `LaneLoudness` constructor, `current_dbfs` must be in 0~255
   */
  await t.step(function LaneLoudness_instance() {
    assertThrows(() => new LaneLoudness("",  0), TypeError, "lane_id must be number, but got string"); // string "" as non number
    assertThrows(() => new LaneLoudness(0 , ""), TypeError, "current_dbfs must be number, but got string");  // string "" as non number

    assertThrows(() => new LaneLoudness(256,   0), RangeError, "lane_id must be 0~255, but got 256");
    assertThrows(() => new LaneLoudness( -1,   0), RangeError, "lane_id must be 0~255, but got -1");
    assertThrows(() => new LaneLoudness(  0, 0.1), RangeError, "current_dbfs must be 0 or negative value, but got 0.1");
  });


  /**
   * - At bytes to `LaneLoudness` convert method, `bytes` must be `Uint8Array`
   * - At bytes to `LaneLoudness` convert method, `bytes` must be 2 length
   */
  await t.step(function LaneLoudness_from_bytes() {
    const lane_loudness_org = new LaneLoudness(0, 0);
    const lane_loudness_bytes_correct = lane_loudness_org.to_bytes();
    const lane_loudness_bytes_invalid_too_short = lane_loudness_bytes_correct.slice(0, -1);
    const lane_loudness_bytes_invalid_too_long  = Uint8Array.of(...lane_loudness_bytes_correct, 0); // 0 as as over length byte

    assertThrows(() => LaneLoudness.from_bytes(""                                   ), TypeError , "bytes must be Uint8Array, but got string");
    assertThrows(() => LaneLoudness.from_bytes(lane_loudness_bytes_invalid_too_short), RangeError, "bytes must be 2, but got 1");
    assertThrows(() => LaneLoudness.from_bytes(lane_loudness_bytes_invalid_too_long ), RangeError, "bytes must be 2, but got 3");
  });
});
