/**
 * @file Tests for `packet_conv/volume_modify.js`
 *
 * Test cases:
 *   * Can encode/decode audio packet
 *   * Raise TypeError if invalid argument type is passed
 *   * Raise RangeError if invalid argument value is passed
 *
 * Test steps:
 *   * Run this script by vitest - `npm test`
 *
 * @author aKuad
 */

import { packet_volume_modify_encode, packet_volume_modify_decode, VOLUME_MODIFY_PACKET_TYPE_ID } from "../../../static/packet_conv/volume_modify.js"
import { describe, test, expect } from "vitest"


describe("true_cases", () => {
  test("enc_dec", () => {
    const lane_id_org = 1;
    const modified_volume_org = 100;
    const raw_packet = packet_volume_modify_encode(lane_id_org, modified_volume_org);
    const [lane_id_prc, modified_volume_prc] = packet_volume_modify_decode(raw_packet);

    expect(lane_id_prc).toBe(lane_id_org);
    expect(modified_volume_prc).toBe(modified_volume_org);
  });
});


describe("err_cases", () => {
  test("enc_invalid_type", () => {
    const lane_id = 1;
    const modified_volume = 100;

    expect(() => packet_volume_modify_encode("", modified_volume)).toThrowError(new TypeError("lane_id must be number"));
    expect(() => packet_volume_modify_encode(lane_id, ""        )).toThrowError(new TypeError("modified_volume must be number"));
  });


  test("enc_invalid_value", () => {
    const lane_id = 1;
    const modified_volume = 100;

    expect(() => packet_volume_modify_encode(256, modified_volume)).toThrowError(new RangeError("lane_id must be in 0~255"));
    expect(() => packet_volume_modify_encode(-1 , modified_volume)).toThrowError(new RangeError("lane_id must be in 0~255"));
    expect(() => packet_volume_modify_encode(lane_id, 256        )).toThrowError(new RangeError("modified_volume must be in 0~255"));
    expect(() => packet_volume_modify_encode(lane_id, -1         )).toThrowError(new RangeError("modified_volume must be in 0~255"));
  });


  test("dec_invalid_type", () => {
    expect(() => packet_volume_modify_decode("")).toThrowError(new TypeError("raw_packet must be Uint8Array"));
    //                                       ~~ as non Uint8Array
  });


  test("dec_invalid_value", () => {
    const raw_packet_invalid_id = Uint8Array.of(0x21, 1, 100);
    //                                          ~~~~ as non 0x20 byte
    const raw_packet_invalid_short_len = Uint8Array.of(VOLUME_MODIFY_PACKET_TYPE_ID, 1);
    // No modified_volume data packet
    const raw_packet_invalid_long_len = Uint8Array.of(VOLUME_MODIFY_PACKET_TYPE_ID, 1, 100, 1);
    // Too long packet

    expect(() => packet_volume_modify_decode(raw_packet_invalid_id)).toThrowError(new RangeError("Invalid packet ID, it si not an volume_modify packet"));
    expect(() => packet_volume_modify_decode(raw_packet_invalid_short_len)).toThrowError(new RangeError("Invalid packet, length must be 3"));
    expect(() => packet_volume_modify_decode(raw_packet_invalid_long_len )).toThrowError(new RangeError("Invalid packet, length must be 3"));
  });
});
