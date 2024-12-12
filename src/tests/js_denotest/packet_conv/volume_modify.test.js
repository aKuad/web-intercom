/**
 * @file Tests for `packet_conv/volume_modify.js`
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test`
 *
 * @author aKuad
 */

import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { packet_volume_modify_encode, packet_volume_modify_decode, is_volume_modify_packet, VOLUME_MODIFY_PACKET_TYPE_ID } from "../../../static/packet_conv/volume_modify.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can encode/decode volume-modify packet
   *   - Original data and decoded data must be equal
   * - Can verify the packet is valid as volume-modify packet
   */
  await t.step(function enc_dec_verify() {
    const lane_id_org = 1;
    const modified_volume_org = 100;
    const raw_packet = packet_volume_modify_encode(lane_id_org, modified_volume_org);
    const {lane_id, modified_volume} = packet_volume_modify_decode(raw_packet);

    assertEquals(is_volume_modify_packet(raw_packet), true);
    assertEquals(lane_id, lane_id_org);
    assertEquals(modified_volume, modified_volume_org);
  });


  /**
   * - Verify function must be return false if non `Uint8Array` passed
   * - Verify function must be return false if empty `Uint8Array` passed
   * - Verify function must be return false if non volume-modify packet passed
   * - Verify function must be return false if too short bytes as volume-modify packet passed
   * - Verify function must be return false if too long bytes as volume-modify packet passed
   * - Verify function must throws for these cases with suitable message when throwing enabled
   */
  await t.step(function verify_ng() {
    const lane_id_org = 1;
    const modified_volume_org = 100;
    const raw_packet_correct = packet_volume_modify_encode(lane_id_org, modified_volume_org);

    const raw_packet_invalid_empty     = new Uint8Array();
    const raw_packet_invalid_id        = Uint8Array.of(0x30, ...raw_packet_correct.slice(1));  // as non 0x20 byte
    const raw_packet_invalid_too_short = raw_packet_correct.slice(0, -1);
    const raw_packet_invalid_too_long  = Uint8Array.of(...raw_packet_correct, 0); // 0 as an over length byte

    assertEquals(is_volume_modify_packet("")                          , false);  // string "" as non Uint8Array
    assertEquals(is_volume_modify_packet(raw_packet_invalid_empty)    , false);
    assertEquals(is_volume_modify_packet(raw_packet_invalid_id)       , false);
    assertEquals(is_volume_modify_packet(raw_packet_invalid_too_short), false);
    assertEquals(is_volume_modify_packet(raw_packet_invalid_too_long) , false);

    assertThrows(() => is_volume_modify_packet(""                          , true), TypeError , "raw_packet must be Uint8Array, but got string");
    assertThrows(() => is_volume_modify_packet(raw_packet_invalid_empty    , true), RangeError, "Empty array passed");
    assertThrows(() => is_volume_modify_packet(raw_packet_invalid_id       , true), RangeError, `It has not a volume_modify packet type ID - should be ${VOLUME_MODIFY_PACKET_TYPE_ID}, but got ${0x30}`);
    assertThrows(() => is_volume_modify_packet(raw_packet_invalid_too_short, true), RangeError, `Too short bytes as volume modify packet - expected 3, but got ${raw_packet_invalid_too_short.length}`);
    assertThrows(() => is_volume_modify_packet(raw_packet_invalid_too_long , true), RangeError, `Too long bytes as volume modify packet - expected 3, but got ${raw_packet_invalid_too_long.length}`);
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - At encoding function, `lane_id` must be `number`
   * - At encoding function, `modified_volume` must be `number`
   */
  await t.step(function enc_invalid_type() {
    const lane_id = 1;
    const modified_volume = 100;

    assertThrows(() => packet_volume_modify_encode("", modified_volume), TypeError, "lane_id must be number, but got string");
    assertThrows(() => packet_volume_modify_encode(lane_id, ""        ), TypeError, "modified_volume must be number, but got string");
  });


  /**
   * - At encoding function, `lane_id` must be in 0~255
   * - At encoding function, `modified_volume` must be in 0~255
   */
  await t.step(function enc_invalid_value() {
    const lane_id = 1;
    const modified_volume = 100;

    assertThrows(() => packet_volume_modify_encode(256, modified_volume), RangeError, "lane_id must be in 0~255, but got 256");
    assertThrows(() => packet_volume_modify_encode(-1 , modified_volume), RangeError, "lane_id must be in 0~255, but got -1");
    assertThrows(() => packet_volume_modify_encode(lane_id, 256        ), RangeError, "modified_volume must be in 0~255, but got 256");
    assertThrows(() => packet_volume_modify_encode(lane_id, -1         ), RangeError, "modified_volume must be in 0~255, but got -1");
  });


  // await t.step(function dec_invalid_type() {
  //   // packet verification integrated to `is_volume_modify_packet` tests
  // });


  // await t.step(function dec_invalid_value() {
  //   // packet verification integrated to `is_volume_modify_packet` tests
  // });


  // await t.step(function verify_invalid_type() {
  //   // no error cases of `is_volume_modify_packet`
  // });


  // await t.step(function verify_invalid_value() {
  //   // no error cases of `is_volume_modify_packet`
  // });
});
