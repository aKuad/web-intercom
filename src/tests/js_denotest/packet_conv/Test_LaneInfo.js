/**
 * @file Tests for `packet_conv/LaneInfo.js` module
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test **Test*.js`
 *
 * @author aKuad
 */

import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { LaneInfo } from "../../../static/packet_conv/LaneInfo.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can be convert between `LaneInfo` and bytes (`Uint8Array`)
   *   - Original object and after conversion data must be equal
   */
  await t.step(function LaneInfo_convert_bytes() {
    const lane_info_org = new LaneInfo(0, "ABC", 127);
    const lane_info_bytes = lane_info_org.to_bytes();
    const lane_info_prc = LaneInfo.from_bytes(lane_info_bytes);

    assertEquals(lane_info_prc, lane_info_org);
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - At `LaneInfo` constructor, `lane_id` must be `number`
   * - At `LaneInfo` constructor, `lane_name` must be `string`
   * - At `LaneInfo` constructor, `current_volume` must be `number`
   * - At `LaneInfo` constructor, `lane_id` must be in 0~255
   * - At `LaneInfo` constructor, `lane_name` must be only ascii characters
   * - At `LaneInfo` constructor, `lane_name` must not be including control ascii characters
   * - At `LaneInfo` constructor, `lane_name` must not be empty `string`
   * - At `LaneInfo` constructor, `lane_name` must not be over or equal 4 length
   * - At `LaneInfo` constructor, `current_volume` must be in 0~255
   */
  await t.step(function LaneInfo_instance() {
    assertThrows(() => new LaneInfo("", "ABC", 127), TypeError, "lane_id must be number, but got string");  // string "" as non number
    assertThrows(() => new LaneInfo(0 ,     1, 127), TypeError, "lane_name must be string, but got number");  // number 1 as non string
    assertThrows(() => new LaneInfo(0 , "ABC",  ""), TypeError, "current_volume must be number, but got string"); // string "" as non number

    assertThrows(() => new LaneInfo(256, "ABC" , 127), RangeError, "lane_id must be 0~255, but got 256");
    assertThrows(() => new LaneInfo( -1, "ABC" , 127), RangeError, "lane_id must be 0~255, but got -1");
    assertThrows(() => new LaneInfo(  0, "🗒" , 127), RangeError, "For lane_name, non ascii characters are not allowed");   // 🗒 as non ascii characters are not allowed
    assertThrows(() => new LaneInfo(  0, "a\rb", 127), RangeError, "For lane_name, non ascii characters are not allowed");  // \n as control ascii characters are not allowed
    assertThrows(() => new LaneInfo(  0, ""    , 127), RangeError, "lane_name can't be empty string");
    assertThrows(() => new LaneInfo(  0, "ABCD", 127), RangeError, "For lane_name, over 3 characters string is not allowed, but got 4 characters");
    assertThrows(() => new LaneInfo(  0, "ABC" , 256), RangeError, "current_volume must be 0~255, but got 256");
    assertThrows(() => new LaneInfo(  0, "ABC" ,  -1), RangeError, "current_volume must be 0~255, but got -1");
  });


  /**
   * - At bytes to `LaneInfo` convert method, `bytes` must be `Uint8Array`
   * - At bytes to `LaneInfo` convert method, `bytes` must be 5 length
   */
  await t.step(function LaneInfo_from_bytes() {
    const lane_info_org = new LaneInfo(0, "ABC", 127);
    const lane_info_bytes_correct = lane_info_org.to_bytes();
    const lane_info_bytes_invalid_too_short = lane_info_bytes_correct.slice(0, -1);
    const lane_info_bytes_invalid_too_long  = Uint8Array.of(...lane_info_bytes_correct, 0); // 0 as as over length byte

    assertThrows(() => LaneInfo.from_bytes(""                               ),  TypeError, "bytes must be Uint8Array, but got string");
    assertThrows(() => LaneInfo.from_bytes(lane_info_bytes_invalid_too_short), RangeError, "bytes must be 5, but got 4");
    assertThrows(() => LaneInfo.from_bytes(lane_info_bytes_invalid_too_long ), RangeError, "bytes must be 5, but got 6");
  });
});
