/**
 * @file Tests for `packet_conv/gain_modify.js`
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test`
 *
 * @author aKuad
 */

import { assertEquals, assertAlmostEquals, assertThrows } from "jsr:@std/assert@1";

import { packet_gain_modify_encode, packet_gain_modify_decode, is_gain_modify_packet, GAIN_MODIFY_PACKET_TYPE_ID } from "../../../static/packet_conv/gain_modify.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can encode/decode gain-modify packet
   *   - Original data and decoded data must be equal
   * - Can verify the packet is valid as gain-modify packet
   */
  await t.step(function enc_dec_verify() {
    const lane_id_org = 1;
    const modified_gain_db_org = 80.0;  // no round error at 80
    const raw_packet = packet_gain_modify_encode(lane_id_org, modified_gain_db_org);
    const {lane_id, modified_gain_db} = packet_gain_modify_decode(raw_packet);

    assertEquals(is_gain_modify_packet(raw_packet), true);
    assertEquals(lane_id, lane_id_org);
    assertEquals(modified_gain_db, modified_gain_db_org);
  });


  /**
   * - `modified_gain_db` conversion error is in tolerance
   *   - During scale conversion [-80, 80] to [0, 255], 0.5 error will be 0.31372549 (= 0.5/255*160)
   */
  await t.step(function gain_conversion_error() {
    const lane_id = 1;
    const modified_gain_db_org = 0.0; // no round error at 80
    const raw_packet = packet_gain_modify_encode(lane_id, modified_gain_db_org);
    const {modified_gain_db} = packet_gain_modify_decode(raw_packet);

    // gain 0 will be converted to 127.5, but in uint8t rounds to 127, then error 0.5
    assertAlmostEquals(modified_gain_db, modified_gain_db_org, 0.314);
  });


  /**
   * - Can under -80 value of `modified_gain_db` adjust to -80
   */
  await t.step(function under_range_adjust() {
    const raw_packet_neg_801 = packet_gain_modify_encode(1, -80.1);
    const raw_packet_neg_inf = packet_gain_modify_encode(1, -Infinity);
    const gain_modify_neg_801 = packet_gain_modify_decode(raw_packet_neg_801);
    const gain_modify_neg_inf = packet_gain_modify_decode(raw_packet_neg_inf);

    assertEquals(gain_modify_neg_801.modified_gain_db, -80);
    assertEquals(gain_modify_neg_inf.modified_gain_db, -80);
  });


  /**
   * - Verify function must be return false if non `Uint8Array` passed
   * - Verify function must be return false if empty `Uint8Array` passed
   * - Verify function must be return false if non gain-modify packet passed
   * - Verify function must be return false if too short bytes as gain-modify packet passed
   * - Verify function must be return false if too long bytes as gain-modify packet passed
   * - Verify function must throws for these cases with suitable message when throwing enabled
   */
  await t.step(function verify_ng() {
    const lane_id_org = 1;
    const modified_gain_db_org = 80.0;
    const raw_packet_correct = packet_gain_modify_encode(lane_id_org, modified_gain_db_org);

    const raw_packet_invalid_empty     = new Uint8Array();
    const raw_packet_invalid_id        = Uint8Array.of(0x30, ...raw_packet_correct.slice(1));  // as non 0x20 byte
    const raw_packet_invalid_too_short = raw_packet_correct.slice(0, -1);
    const raw_packet_invalid_too_long  = Uint8Array.of(...raw_packet_correct, 0); // 0 as an over length byte

    assertEquals(is_gain_modify_packet("")                          , false);  // string "" as non Uint8Array
    assertEquals(is_gain_modify_packet(raw_packet_invalid_empty)    , false);
    assertEquals(is_gain_modify_packet(raw_packet_invalid_id)       , false);
    assertEquals(is_gain_modify_packet(raw_packet_invalid_too_short), false);
    assertEquals(is_gain_modify_packet(raw_packet_invalid_too_long) , false);

    assertThrows(() => is_gain_modify_packet(""                          , true), TypeError , "raw_packet must be Uint8Array, but got string");
    assertThrows(() => is_gain_modify_packet(raw_packet_invalid_empty    , true), RangeError, "Empty array passed");
    assertThrows(() => is_gain_modify_packet(raw_packet_invalid_id       , true), RangeError, `It has not a gain_modify packet type ID - should be ${GAIN_MODIFY_PACKET_TYPE_ID}, but got ${0x30}`);
    assertThrows(() => is_gain_modify_packet(raw_packet_invalid_too_short, true), RangeError, `Too short bytes as gain modify packet - expected 3, but got ${raw_packet_invalid_too_short.length}`);
    assertThrows(() => is_gain_modify_packet(raw_packet_invalid_too_long , true), RangeError, `Too long bytes as gain modify packet - expected 3, but got ${raw_packet_invalid_too_long.length}`);
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - At encoding function, `lane_id` must be `number`
   * - At encoding function, `modified_gain_db` must be `number`
   */
  await t.step(function enc_invalid_type() {
    const lane_id = 1;
    const modified_gain_db = 80.0;

    assertThrows(() => packet_gain_modify_encode("", modified_gain_db), TypeError, "lane_id must be number, but got string");
    assertThrows(() => packet_gain_modify_encode(lane_id, ""         ), TypeError, "modified_gain_db must be number, but got string");
  });


  /**
   * - At encoding function, `lane_id` must be in 0~255
   * - At encoding function, `modified_gain_db` must be under or equal 80
   */
  await t.step(function enc_invalid_value() {
    const lane_id = 1;
    const modified_gain_db = 80.0;

    assertThrows(() => packet_gain_modify_encode(256, modified_gain_db), RangeError, "lane_id must be in 0~255, but got 256");
    assertThrows(() => packet_gain_modify_encode(-1 , modified_gain_db), RangeError, "lane_id must be in 0~255, but got -1");
    assertThrows(() => packet_gain_modify_encode(lane_id, 80.1        ), RangeError, "modified_gain_db must be under or equal 80, but got 80.1");
  });


  // await t.step(function dec_invalid_type() {
  //   // packet verification integrated to `is_gain_modify_packet` tests
  // });


  // await t.step(function dec_invalid_value() {
  //   // packet verification integrated to `is_gain_modify_packet` tests
  // });


  // await t.step(function verify_invalid_type() {
  //   // no error cases of `is_gain_modify_packet`
  // });


  // await t.step(function verify_invalid_value() {
  //   // no error cases of `is_gain_modify_packet`
  // });
});
