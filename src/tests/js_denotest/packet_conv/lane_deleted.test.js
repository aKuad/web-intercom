/**
 * @file Tests for `packet_conv/lane_deleted.js`
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test`
 *
 * @author aKuad
 */

import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { packet_lane_deleted_encode, packet_lane_deleted_decode, is_lane_deleted_packet, LANE_DELETED_PACKET_TYPE_ID } from "../../../static/packet_conv/lane_deleted.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can encode/decode lane-deleted packet
   *   - Original data and decoded data must be equal
   * - Can verify the packet is valid as lane-deleted packet
   */
  await t.step(function enc_dec_verify() {
    const lane_id_org = 1;
    const raw_packet = packet_lane_deleted_encode(lane_id_org);
    const {lane_id } = packet_lane_deleted_decode(raw_packet);

    assertEquals(is_lane_deleted_packet(raw_packet), true);
    assertEquals(lane_id, lane_id_org);
  });


  /**
   * - Verify function must be return false if non `Uint8Array` passed
   * - Verify function must be return false if empty `Uint8Array` passed
   * - Verify function must be return false if non lane-deleted packet passed
   * - Verify function must be return false if too short bytes as lane-deleted packet passed
   * - Verify function must be return false if too long bytes as lane-deleted packet passed
   * - Verify function must throws for these cases with suitable message when throwing enabled
   */
  await t.step(function verify_ng() {
    const lane_id_org = 1;
    const raw_packet_correct = packet_lane_deleted_encode(lane_id_org);

    const raw_packet_invalid_empty     = new Uint8Array();
    const raw_packet_invalid_id        = Uint8Array.of(0x30, ...raw_packet_correct.slice(1)); // as non 0x33 byte
    const raw_packet_invalid_too_short = raw_packet_correct.slice(0, -1);
    const raw_packet_invalid_too_long  = Uint8Array.of(...raw_packet_correct, 0); // 0 as an over length byte

    assertEquals(is_lane_deleted_packet("")                          , false);  // string "" as non Uint8Array
    assertEquals(is_lane_deleted_packet(raw_packet_invalid_empty)    , false);
    assertEquals(is_lane_deleted_packet(raw_packet_invalid_id)       , false);
    assertEquals(is_lane_deleted_packet(raw_packet_invalid_too_short), false);
    assertEquals(is_lane_deleted_packet(raw_packet_invalid_too_long) , false);

    assertThrows(() => is_lane_deleted_packet(""                          , true), TypeError , "raw_packet must be Uint8Array, but got string");
    assertThrows(() => is_lane_deleted_packet(raw_packet_invalid_empty    , true), RangeError, "Empty array passed");
    assertThrows(() => is_lane_deleted_packet(raw_packet_invalid_id       , true), RangeError, `It has not a lane_deleted packet type ID - should be ${LANE_DELETED_PACKET_TYPE_ID}, but got ${0x30}`);
    assertThrows(() => is_lane_deleted_packet(raw_packet_invalid_too_short, true), RangeError, `Too short bytes as lane deleted packet - expected 2, but got ${raw_packet_invalid_too_short.length}`);
    assertThrows(() => is_lane_deleted_packet(raw_packet_invalid_too_long , true), RangeError, `Too long bytes as lane deleted packet - expected 2, but got ${raw_packet_invalid_too_long.length}`);
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - At encoding function, `lane_id` must be `number`
   */
  await t.step(function enc_invalid_type() {
    assertThrows(() => packet_lane_deleted_encode(""), TypeError, "lane_id must be number, but got string");
  });


  /**
   * - At encoding function, `lane_id` must be in 0~255
   */
  await t.step(function enc_invalid_value() {
    assertThrows(() => packet_lane_deleted_encode(256), RangeError, "lane_id must be in 0~255, but got 256");
    assertThrows(() => packet_lane_deleted_encode( -1), RangeError, "lane_id must be in 0~255, but got -1");
  });


  // await t.step(function dec_invalid_type() {
  //   // packet verification integrated to `is_lane_deleted_packet` tests
  // });


  // await t.step(function dec_invalid_value() {
  //   // packet verification integrated to `is_lane_deleted_packet` tests
  // });


  // await t.step(function verify_invalid_type() {
  //   // no error cases of `is_lane_deleted_packet`
  // });


  // await t.step(function verify_invalid_value() {
  //   // no error cases of `is_lane_deleted_packet`
  // });
});
