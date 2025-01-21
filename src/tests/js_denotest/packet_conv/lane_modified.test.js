/**
 * @file Tests for `packet_conv/lane_modified.js` module
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test`
 *
 * @author aKuad
 */

import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { LaneInfo } from "../../../static/packet_conv/LaneInfo.js";
import { packet_lane_modified_encode, packet_lane_modified_decode, is_lane_modified_packet, LANE_MODIFIED_PACKET_TYPE_ID } from "../../../static/packet_conv/lane_modified.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can encode/decode lane-modified packet
   *   - Original data and decoded data must be equal
   * - Can verify the packet is valid as lane-modified packet
   */
  await t.step(function enc_dec_verify() {
    const lane_info_org = new LaneInfo(0, "ABC",  80); // no round error at 80

    const raw_packet = packet_lane_modified_encode(lane_info_org);
    const lane_modified_prc = packet_lane_modified_decode(raw_packet);

    assertEquals(is_lane_modified_packet(raw_packet), true);
    assertEquals(lane_modified_prc, lane_info_org);
  });


  /**
   * - Verify function must be return false if non `Uint8Array` passed
   * - Verify function must be return false if empty `Uint8Array` passed
   * - Verify function must be return false if non lane-modified packet passed
   * - Verify function must be return false if too short bytes as lane-modified packet passed
   * - Verify function must be return false if too long bytes as lane-modified packet passed
   * - Verify function must throws for these cases with suitable message when throwing enabled
   */
  await t.step(function verify_ng() {
    const lane_info_org = new LaneInfo(0, "ABC", 0);
    const raw_packet_correct = packet_lane_modified_encode(lane_info_org);

    const raw_packet_invalid_empty     = new Uint8Array();
    const raw_packet_invalid_id        = Uint8Array.of(0x40, ...raw_packet_correct.slice(1));  // as non 0x31 byte
    const raw_packet_invalid_too_short = raw_packet_correct.slice(0, -1);
    const raw_packet_invalid_too_long  = Uint8Array.of(...raw_packet_correct, 0); // 0 as an over length byte

    assertEquals(is_lane_modified_packet("")                          , false);
    assertEquals(is_lane_modified_packet(raw_packet_invalid_empty)    , false);
    assertEquals(is_lane_modified_packet(raw_packet_invalid_id)       , false);
    assertEquals(is_lane_modified_packet(raw_packet_invalid_too_short), false);
    assertEquals(is_lane_modified_packet(raw_packet_invalid_too_long) , false);

    assertThrows(() => is_lane_modified_packet(""                          , true),  TypeError, "raw_packet must be Uint8Array, but got string");
    assertThrows(() => is_lane_modified_packet(raw_packet_invalid_empty    , true), RangeError, "Empty array passed");
    assertThrows(() => is_lane_modified_packet(raw_packet_invalid_id       , true), RangeError, `It has not an lane_modified packet type ID - should be ${LANE_MODIFIED_PACKET_TYPE_ID}, but got ${0x40}`);
    assertThrows(() => is_lane_modified_packet(raw_packet_invalid_too_short, true), RangeError, "Too short bytes as lane modified packet - expected 6, but got 5");
    assertThrows(() => is_lane_modified_packet(raw_packet_invalid_too_long , true), RangeError, "Too long bytes as lane modified packet - expected 6, but got 7");
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - At encoding function, `lane_info` must be `LaneInfo`
   */
  await t.step(function enc_invalid_type() {
    assertThrows(() => packet_lane_modified_encode(""),   TypeError , "lane_info must be LaneInfo, but got string");  // string "" as non Array
  });


  // await t.step(function enc_invalid_value() {
  //   // value check will be done by `LaneInfo`
  // });


  // await t.step(function dec_invalid_type() {
  //   // packet verification integrated to `is_lane_modified_packet` tests
  // });


  // await t.step(function dec_invalid_value() {
  //   // packet verification integrated to `is_lane_modified_packet` tests
  // });


  // await t.step(function verify_invalid_type() {
  //   // no error cases of `is_lane_modified_packet`
  // });


  // await t.step(function verify_invalid_value() {
  //   // no error cases of `is_lane_modified_packet`
  // });
});
