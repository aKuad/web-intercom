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

import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { LaneLoudness } from "../../../static/packet_conv/LaneLoudness.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can be convert between `LaneLoudness` and bytes (`Uint8Array`)
   *   - Original object and after conversion data must be equal
   */
  await t.step(function LaneLoudness_convert_bytes() {
    const lane_loudness_org = new LaneLoudness(0, 127);
    const lane_loudness_bytes = lane_loudness_org.to_bytes();
    const lane_loudness_prc = LaneLoudness.from_bytes(lane_loudness_bytes);

    assertEquals(lane_loudness_prc, lane_loudness_org);
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - At `LaneLoudness` constructor, `lane_id` must be `number`
   * - At `LaneLoudness` constructor, `current_loudness` must be `number`
   * - At `LaneLoudness` constructor, `lane_id` must be in 0~255
   * - At `LaneLoudness` constructor, `current_loudness` must be in 0~255
   */
  await t.step(function LaneLoudness_instance() {
    assertThrows(() => new LaneLoudness("", 127), TypeError, "lane_id must be number, but got string"); // string "" as non number
    assertThrows(() => new LaneLoudness(0 ,  ""), TypeError, "current_loudness must be number, but got string");  // string "" as non number

    assertThrows(() => new LaneLoudness(256, 127), RangeError, "lane_id must be 0~255, but got 256");
    assertThrows(() => new LaneLoudness( -1, 127), RangeError, "lane_id must be 0~255, but got -1");
    assertThrows(() => new LaneLoudness(  0, 256), RangeError, "current_loudness must be 0~255, but got 256");
    assertThrows(() => new LaneLoudness(  0,  -1), RangeError, "current_loudness must be 0~255, but got -1");
  });


  /**
   * - At bytes to `LaneLoudness` convert method, `bytes` must be `Uint8Array`
   * - At bytes to `LaneLoudness` convert method, `bytes` must be 2 length
   */
  await t.step(function LaneLoudness_from_bytes() {
    const lane_loudness_org = new LaneLoudness(0, 127);
    const lane_loudness_bytes_correct = lane_loudness_org.to_bytes();
    const lane_loudness_bytes_invalid_too_short = lane_loudness_bytes_correct.slice(0, -1);
    const lane_loudness_bytes_invalid_too_long  = Uint8Array.of(...lane_loudness_bytes_correct, 0); // 0 as as over length byte

    assertThrows(() => LaneLoudness.from_bytes(""                               ),  TypeError, "bytes must be Uint8Array, but got string");
    assertThrows(() => LaneLoudness.from_bytes(lane_loudness_bytes_invalid_too_short), RangeError, "bytes must be 2, but got 1");
    assertThrows(() => LaneLoudness.from_bytes(lane_loudness_bytes_invalid_too_long ), RangeError, "bytes must be 2, but got 3");
  });
});
