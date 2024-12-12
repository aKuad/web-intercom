/**
 * @file Tests for `packet_conv/LaneInfo.js` module
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test`
 *
 * @author aKuad
 */

import { assertEquals, assertAlmostEquals, assertThrows } from "jsr:@std/assert@1";

import { LaneInfo } from "../../../static/packet_conv/LaneInfo.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can be convert between `LaneInfo` and bytes (`Uint8Array`)
   *   - Original object and after conversion data must be equal
   */
  await t.step(function LaneInfo_convert_bytes() {
    const lane_info_org = new LaneInfo(0, "ABC", 80); // no round error at 80
    const lane_info_bytes = lane_info_org.to_bytes();
    const lane_info_prc = LaneInfo.from_bytes(lane_info_bytes);

    assertEquals(lane_info_prc, lane_info_org);
  });


  /**
   * - `current_gain_db` conversion error is in tolerance
   *   - During scale conversion [-80, 80] to [0, 255], 0.5 error will be 0.31372549 (= 0.5/255*160)
   */
  await t.step(function gain_conversion_error() {
    const lane_info_org = new LaneInfo(0, "ABC", 0);
    const lane_info_bytes = lane_info_org.to_bytes();
    const lane_info_prc = LaneInfo.from_bytes(lane_info_bytes);

    // gain 0 will be converted to 127.5, but in uint8t rounds to 127, then error 0.5
    assertAlmostEquals(lane_info_prc.current_gain_db, lane_info_org.current_gain_db, 0.314);
  });


  /**
   * - Can under -80 value of `current_gain_db` adjust to -80
   */
  await t.step(function under_range_adjust() {
    const lane_info_gain_neg_801 = new LaneInfo(0, "ABC", -80.1);
    const lane_info_gain_neg_inf = new LaneInfo(0, "ABC", -Infinity);

    assertEquals(lane_info_gain_neg_801.current_gain_db, -80);
    assertEquals(lane_info_gain_neg_inf.current_gain_db, -80);
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - At `LaneInfo` constructor, `lane_id` must be `number`
   * - At `LaneInfo` constructor, `lane_name` must be `string`
   * - At `LaneInfo` constructor, `current_gain_db` must be `number`
   * - At `LaneInfo` constructor, `lane_id` must be in 0~255
   * - At `LaneInfo` constructor, `lane_name` must be only ascii characters
   * - At `LaneInfo` constructor, `lane_name` must not be including control ascii characters
   * - At `LaneInfo` constructor, `lane_name` must not be empty `string`
   * - At `LaneInfo` constructor, `lane_name` must not be over or equal 4 length
   * - At `LaneInfo` constructor, `current_gain_db` must be under or equal 80
   */
  await t.step(function LaneInfo_instance() {
    assertThrows(() => new LaneInfo("", "ABC", 80), TypeError, "lane_id must be number, but got string");  // string "" as non number
    assertThrows(() => new LaneInfo(0 ,     1, 80), TypeError, "lane_name must be string, but got number");  // number 1 as non string
    assertThrows(() => new LaneInfo(0 , "ABC", ""), TypeError, "current_gain_db must be number, but got string"); // string "" as non number

    assertThrows(() => new LaneInfo(256, "ABC" ,   80), RangeError, "lane_id must be 0~255, but got 256");
    assertThrows(() => new LaneInfo( -1, "ABC" ,   80), RangeError, "lane_id must be 0~255, but got -1");
    assertThrows(() => new LaneInfo(  0, "🗒" ,   80), RangeError, "For lane_name, non ascii characters are not allowed");   // 🗒 as non ascii characters are not allowed
    assertThrows(() => new LaneInfo(  0, "a\rb",   80), RangeError, "For lane_name, non ascii characters are not allowed");  // \n as control ascii characters are not allowed
    assertThrows(() => new LaneInfo(  0, ""    ,   80), RangeError, "lane_name can't be empty string");
    assertThrows(() => new LaneInfo(  0, "ABCD",   80), RangeError, "For lane_name, over 3 characters string is not allowed, but got 4 characters");
    assertThrows(() => new LaneInfo(  0, "ABC" , 80.1), RangeError, "current_gain_db must be under or equal 80, but got 80.1");
  });


  /**
   * - At bytes to `LaneInfo` convert method, `bytes` must be `Uint8Array`
   * - At bytes to `LaneInfo` convert method, `bytes` must be 5 length
   */
  await t.step(function LaneInfo_from_bytes() {
    const lane_info_org = new LaneInfo(0, "ABC", 80);
    const lane_info_bytes_correct = lane_info_org.to_bytes();
    const lane_info_bytes_invalid_too_short = lane_info_bytes_correct.slice(0, -1);
    const lane_info_bytes_invalid_too_long  = Uint8Array.of(...lane_info_bytes_correct, 0); // 0 as as over length byte

    assertThrows(() => LaneInfo.from_bytes(""                               ),  TypeError, "bytes must be Uint8Array, but got string");
    assertThrows(() => LaneInfo.from_bytes(lane_info_bytes_invalid_too_short), RangeError, "bytes must be 5, but got 4");
    assertThrows(() => LaneInfo.from_bytes(lane_info_bytes_invalid_too_long ), RangeError, "bytes must be 5, but got 6");
  });
});
