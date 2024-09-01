/**
 * @file Tests for `packet_conv/lanes_info.js` module
 *
 * Test cases:
 *   * Can encode/decode lanes-info packet
 *   * Raise TypeError if invalid argument type is passed (all arguments)
 *   * Raise RangeError if invalid argument value is passed (more detail, see test code below)
 *
 * Test steps:
 *   * Run this script by deno test - `deno test **Test*.js`
 *
 * @author aKuad
 */

import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { LaneInfo, packet_lanes_info_encode, packet_lanes_info_decode, is_lanes_info_packet, LANES_INFO_PACKET_TYPE_ID } from "../../../static/packet_conv/lanes_info.js";


Deno.test(async function true_cases(t) {
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


  await t.step(function LaneInfo_convert_bytes() {
    const lane_info_org = new LaneInfo(0, "ABC", 127);
    const lane_info_bytes = lane_info_org.to_bytes();
    const lane_info_prc = LaneInfo.from_bytes(lane_info_bytes);

    assertEquals(lane_info_prc, lane_info_org);
  });


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
  await t.step(function LaneInfo_instance() {
    assertThrows(() => new LaneInfo("", "ABC", 127), TypeError, "lane_id must be number, but got string");  // string "" as non number
    assertThrows(() => new LaneInfo(0 ,     1, 127), TypeError, "lane_name must be string, but got number");  // number 1 as non string
    assertThrows(() => new LaneInfo(0 , "ABC",  ""), TypeError, "current_volume must be number, but got string"); // string "" as non number

    assertThrows(() => new LaneInfo(256, "ABC" , 127), RangeError, "lane_id must be 0~255, but got 256");
    assertThrows(() => new LaneInfo( -1, "ABC" , 127), RangeError, "lane_id must be 0~255, but got -1");
    assertThrows(() => new LaneInfo(  0, "🗒" , 127), RangeError, "For lane_name, non ascii characters are not allowed");
    assertThrows(() => new LaneInfo(  0, ""    , 127), RangeError, "lane_name can't be empty string");
    assertThrows(() => new LaneInfo(  0, "ABCD", 127), RangeError, "For lane_name, over 3 characters string is not allowed, but got 4 characters");
    assertThrows(() => new LaneInfo(  0, "ABC" , 256), RangeError, "current_volume must be 0~255, but got 256");
    assertThrows(() => new LaneInfo(  0, "ABC" ,  -1), RangeError, "current_volume must be 0~255, but got -1");
  });


  await t.step(function LaneInfo_from_bytes() {
    const lane_info_org = new LaneInfo(0, "ABC", 127);
    const lane_info_bytes_correct = lane_info_org.to_bytes();
    const lane_info_bytes_invalid_too_short = lane_info_bytes_correct.slice(0, -1);
    const lane_info_bytes_invalid_too_long  = Uint8Array.of(...lane_info_bytes_correct, 0); // 0 as as over length byte

    assertThrows(() => LaneInfo.from_bytes(""                               ),  TypeError, "bytes must be Uint8Array, but got string");
    assertThrows(() => LaneInfo.from_bytes(lane_info_bytes_invalid_too_short), RangeError, "bytes must be 5, but got 4");
    assertThrows(() => LaneInfo.from_bytes(lane_info_bytes_invalid_too_long ), RangeError, "bytes must be 5, but got 6");
  });


  await t.step(function enc_invalid_type() {
    assertThrows(() => packet_lanes_info_encode(""),   TypeError , "lanes_info must be Array, but got string");  // string "" as non Array
    assertThrows(() => packet_lanes_info_encode([""]), TypeError , "Non LaneInfo elements detected"); // string "" as non LaneInfo element
  });


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
