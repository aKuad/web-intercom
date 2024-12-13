/**
 * @file Tests for `packet_conv/lanes_loudness.js` module
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test`
 *
 * @author aKuad
 */

import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { LaneLoudness } from "../../../static/packet_conv/LaneLoudness.js";
import { packet_lanes_loudness_encode, packet_lanes_loudness_decode, is_lanes_loudness_packet, LANES_LOUDNESS_PACKET_TYPE_ID } from "../../../static/packet_conv/lanes_loudness.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can encode/decode lanes_loudness packet
   *   - Original data and decoded data must be equal
   * - Can verify the packet is valid as lanes_loudness packet
   */
  await t.step(function enc_dec_verify() {
    const lanes_loudness_org = [
      new LaneLoudness(0,   0), // no round error at 0
      new LaneLoudness(1, -80), // or -80
      new LaneLoudness(2, -80)
    ];

    const raw_packet = packet_lanes_loudness_encode(lanes_loudness_org);
    const lanes_loudness_prc = packet_lanes_loudness_decode(raw_packet);

    assertEquals(is_lanes_loudness_packet(raw_packet), true);
    assertEquals(lanes_loudness_prc, lanes_loudness_org);
  });


  /**
   * - Verify function must be return false if non `Uint8Array` passed
   * - Verify function must be return false if empty `Uint8Array` passed
   * - Verify function must be return false if non lanes_loudness packet passed
   * - Verify function must be return false if too short bytes as lanes_loudness packet passed
   * - Verify function must be return false if too long bytes as lanes_loudness packet passed
   * - Verify function must throws for these cases with suitable message when throwing enabled
   */
  await t.step(function verify_ng() {
    const lanes_loudness_org = [
      new LaneLoudness(0, 0)
    ];
    const raw_packet_correct = packet_lanes_loudness_encode(lanes_loudness_org);

    const raw_packet_invalid_empty     = new Uint8Array();
    const raw_packet_invalid_id        = Uint8Array.of(0x50, ...raw_packet_correct.slice(1));  // as non 0x40 byte
    const raw_packet_invalid_too_short = raw_packet_correct.slice(0, -1);
    const raw_packet_invalid_too_long  = Uint8Array.of(...raw_packet_correct, 0); // 0 as an over length byte

    assertEquals(is_lanes_loudness_packet("")                          , false);
    assertEquals(is_lanes_loudness_packet(raw_packet_invalid_empty)    , false);
    assertEquals(is_lanes_loudness_packet(raw_packet_invalid_id)       , false);
    assertEquals(is_lanes_loudness_packet(raw_packet_invalid_too_short), false);
    assertEquals(is_lanes_loudness_packet(raw_packet_invalid_too_long) , false);

    assertThrows(() => is_lanes_loudness_packet(""                          , true),  TypeError, "raw_packet must be Uint8Array, but got string");
    assertThrows(() => is_lanes_loudness_packet(raw_packet_invalid_empty    , true), RangeError, "Empty array passed");
    assertThrows(() => is_lanes_loudness_packet(raw_packet_invalid_id       , true), RangeError, `It has not an lanes_loudness packet type ID - should be ${LANES_LOUDNESS_PACKET_TYPE_ID}, but got ${0x50}`);
    assertThrows(() => is_lanes_loudness_packet(raw_packet_invalid_too_short, true), RangeError, "Invalid length bytes as lanes_loudness packet, may be broken");
    assertThrows(() => is_lanes_loudness_packet(raw_packet_invalid_too_long , true), RangeError, "Invalid length bytes as lanes_loudness packet, may be broken");
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - At encoding function, `lanes_loudness` must be `Array[LaneLoudness]`
   * - At encoding function, `lanes_loudness` must be including only `LaneLoudness`
   */
  await t.step(function enc_invalid_type() {
    assertThrows(() => packet_lanes_loudness_encode(""),   TypeError , "lanes_loudness must be Array, but got string");  // string "" as non Array
    assertThrows(() => packet_lanes_loudness_encode([""]), TypeError , "Non LaneLoudness elements detected"); // string "" as non LaneLoudness element
  });


  /**
   * - At encoding function, `lanes_loudness` must not be empty `Array`
   */
  await t.step(function enc_invalid_value() {
    assertThrows(() => packet_lanes_loudness_encode([]), RangeError, "Empty array passed");
  });


  // await t.step(function dec_invalid_type() {
  //   // packet verification integrated to `is_lanes_loudness_packet` tests
  // });


  // await t.step(function dec_invalid_value() {
  //   // packet verification integrated to `is_lanes_loudness_packet` tests
  // });


  // await t.step(function verify_invalid_type() {
  //   // no error cases of `is_lanes_loudness_packet`
  // });


  // await t.step(function verify_invalid_value() {
  //   // no error cases of `is_lanes_loudness_packet`
  // });
});
