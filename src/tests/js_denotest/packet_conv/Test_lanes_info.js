/**
 * @file Tests for `packet_conv/lanes_info.js` module
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test **Test*.js`
 *
 * @author aKuad
 */

import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { LaneInfo, packet_lanes_info_encode, packet_lanes_info_decode, is_lanes_info_packet, LANES_INFO_PACKET_TYPE_ID } from "../../../static/packet_conv/lanes_info.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can encode/decode lanes-info packet
   *   - Original data and decoded data must be equal
   * - Can verify the packet is valid as lanes-info packet
   */
  await t.step(function enc_dec_verify() {
    const lanes_info_org = [
      new LaneInfo(0, "ABC", 127),
      new LaneInfo(1, "DEF",  50),
      new LaneInfo(2, "G"  , 200)
    ];

    const raw_packet = packet_lanes_info_encode(lanes_info_org);
    const lanes_info_prc = packet_lanes_info_decode(raw_packet);

    assertEquals(is_lanes_info_packet(raw_packet), true);
    assertEquals(lanes_info_prc, lanes_info_org);
  });


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


  /**
   * - Verify function must be return false if non `Uint8Array` passed
   * - Verify function must be return false if empty `Uint8Array` passed
   * - Verify function must be return false if non lanes-info packet passed
   * - Verify function must be return false if too short bytes as lanes-info packet passed
   * - Verify function must be return false if too long bytes as lanes-info packet passed
   * - Verify function must throws for these cases with suitable message when throwing enabled
   */
  await t.step(function verify_ng() {
    const lanes_info_org = [
      new LaneInfo(0, "ABC", 127)
    ];
    const raw_packet_correct = packet_lanes_info_encode(lanes_info_org);

    const raw_packet_invalid_empty     = new Uint8Array();
    const raw_packet_invalid_id        = Uint8Array.of(0x40, ...raw_packet_correct.slice(1));  // as non 0x30 byte
    const raw_packet_invalid_too_short = raw_packet_correct.slice(0, -1);
    const raw_packet_invalid_too_long  = Uint8Array.of(...raw_packet_correct, 0); // 0 as an over length byte

    assertEquals(is_lanes_info_packet("")                          , false);
    assertEquals(is_lanes_info_packet(raw_packet_invalid_empty)    , false);
    assertEquals(is_lanes_info_packet(raw_packet_invalid_id)       , false);
    assertEquals(is_lanes_info_packet(raw_packet_invalid_too_short), false);
    assertEquals(is_lanes_info_packet(raw_packet_invalid_too_long) , false);

    assertThrows(() => is_lanes_info_packet(""                          , true),  TypeError, "raw_packet must be Uint8Array, but got string");
    assertThrows(() => is_lanes_info_packet(raw_packet_invalid_empty    , true), RangeError, "Empty array passed");
    assertThrows(() => is_lanes_info_packet(raw_packet_invalid_id       , true), RangeError, `It has not an lanes_info packet type ID - should be ${LANES_INFO_PACKET_TYPE_ID}, but got ${0x40}`);
    assertThrows(() => is_lanes_info_packet(raw_packet_invalid_too_short, true), RangeError, "Invalid length bytes as lanes_info packet, may be broken");
    assertThrows(() => is_lanes_info_packet(raw_packet_invalid_too_long , true), RangeError, "Invalid length bytes as lanes_info packet, may be broken");
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


  /**
   * - At encoding function, `lanes_info` must be `Array[LaneInfo]`
   * - At encoding function, `lanes_info` must be including only `LaneInfo`
   */
  await t.step(function enc_invalid_type() {
    assertThrows(() => packet_lanes_info_encode(""),   TypeError , "lanes_info must be Array, but got string");  // string "" as non Array
    assertThrows(() => packet_lanes_info_encode([""]), TypeError , "Non LaneInfo elements detected"); // string "" as non LaneInfo element
  });


  /**
   * - At encoding function, `lanes_info` must not be empty `Array`
   */
  await t.step(function enc_invalid_value() {
    assertThrows(() => packet_lanes_info_encode([]), RangeError, "Empty array passed");
  });


  // await t.step(function dec_invalid_type() {
  //   // packet verification integrated to `is_lanes_info_packet` tests
  // });


  // await t.step(function dec_invalid_value() {
  //   // packet verification integrated to `is_lanes_info_packet` tests
  // });


  // await t.step(function verify_invalid_type() {
  //   // no error cases of `is_lanes_info_packet`
  // });


  // await t.step(function verify_invalid_value() {
  //   // no error cases of `is_lanes_info_packet`
  // });
});
