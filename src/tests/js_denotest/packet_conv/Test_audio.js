/**
 * @file Tests for `packet_conv/audio.js` module
 *
 * Test cases:
 *   * Can encode/decode audio packet
 *   * Raise TypeError if invalid argument type is passed
 *   * Raise RangeError if invalid argument value is passed
 *
 * Test steps:
 *   * Run this script by deno test - `deno test **Test*.js`
 *
 * @author aKuad
 */

import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { ONE_FRAME_SAMPLES } from "../../../static/packet_conv/AUDIO_PARAM.js";
import { packet_audio_encode, packet_audio_decode, is_audio_packet } from "../../../static/packet_conv/audio.js";
import { generate_rand_float32array } from "../util/rand_f32a.js";
import { assertAlmostEqualsArray } from "../util/assertAlmostEqualsArray.js";


const ERR_INT16_AND_FLOAT32 = 1 / 32767;


Deno.test(async function true_cases(t) {
  await t.step(function enc_dec_verify_ext() {
    const audio_pcm_org = generate_rand_float32array(ONE_FRAME_SAMPLES);
    const lane_name_org = "ABC";
    const ext_bytes_org = new Uint8Array([1,2,3,4]);
    const raw_packet = packet_audio_encode(audio_pcm_org, lane_name_org, ext_bytes_org);
    const [audio_pcm_prc, lane_name_prc, ext_bytes_prc] = packet_audio_decode(raw_packet);

    assertEquals(is_audio_packet(raw_packet), true);
    assertAlmostEqualsArray(audio_pcm_org, audio_pcm_prc, ERR_INT16_AND_FLOAT32);
    assertEquals(lane_name_prc, lane_name_org);
    assertEquals(ext_bytes_prc, ext_bytes_org);
  });


  await t.step(function enc_dec_verify_noext() {
    const audio_pcm_org = generate_rand_float32array(ONE_FRAME_SAMPLES);
    const lane_name_org = "ABC";
    const ext_bytes_org = new Uint8Array();
    const raw_packet = packet_audio_encode(audio_pcm_org, lane_name_org, ext_bytes_org);
    const [audio_pcm_prc, lane_name_prc, ext_bytes_prc] = packet_audio_decode(raw_packet);

    assertEquals(is_audio_packet(raw_packet), true);
    assertAlmostEqualsArray(audio_pcm_org, audio_pcm_prc, ERR_INT16_AND_FLOAT32);
    assertEquals(lane_name_prc, lane_name_org);
    assertEquals(ext_bytes_prc, ext_bytes_org);
  });


  await t.step(function enc_dec_verify_silent_ext() {
    const audio_pcm_org = generate_rand_float32array(ONE_FRAME_SAMPLES).map(e => e * 0.1);  // Apply gain -20[dB] = 10 ** (-20/20) = 0.1
    const silent_pcm = new Float32Array(ONE_FRAME_SAMPLES); // Zeros array
    const lane_name_org = "ABC";
    const ext_bytes_org = new Uint8Array([1,2,3,4]);
    const raw_packet = packet_audio_encode(audio_pcm_org, lane_name_org, ext_bytes_org);
    const [audio_pcm_prc, lane_name_prc, ext_bytes_prc] = packet_audio_decode(raw_packet);

    assertEquals(is_audio_packet(raw_packet), true);
    assertEquals(audio_pcm_prc, silent_pcm);
    assertEquals(lane_name_prc, lane_name_org);
    assertEquals(ext_bytes_prc, ext_bytes_org);
  });


  await t.step(function enc_dec_verify_silent_noext() {
    const audio_pcm_org = generate_rand_float32array(ONE_FRAME_SAMPLES).map(e => e * 0.1);  // Apply gain -20[dB] = 10 ** (-20/20) = 0.1
    const silent_pcm = new Float32Array(ONE_FRAME_SAMPLES); // Zeros array
    const lane_name_org = "ABC";
    const ext_bytes_org = new Uint8Array();
    const raw_packet = packet_audio_encode(audio_pcm_org, lane_name_org, ext_bytes_org);
    const [audio_pcm_prc, lane_name_prc, ext_bytes_prc] = packet_audio_decode(raw_packet);

    assertEquals(is_audio_packet(raw_packet), true);
    assertEquals(audio_pcm_prc, silent_pcm);
    assertEquals(lane_name_prc, lane_name_org);
    assertEquals(ext_bytes_prc, ext_bytes_org);
  });


  await t.step(function verify_ng() {
    const audio_pcm_org = generate_rand_float32array(ONE_FRAME_SAMPLES);
    const lane_name_org = "ABC";
    const ext_bytes_org = new Uint8Array();
    const raw_packet_correct = packet_audio_encode(audio_pcm_org, lane_name_org, ext_bytes_org);
    const audio_pcm_silent_org = new Float32Array(ONE_FRAME_SAMPLES);
    const raw_packet_silent_correct = packet_audio_encode(audio_pcm_silent_org, lane_name_org, ext_bytes_org);

    const raw_packet_invalid_empty                  = new Uint8Array();
    const raw_packet_invalid_id                     = Uint8Array.of(0x20, ...raw_packet_correct.slice(1)); // 0x20 as non 0x10 or 0x11 byte
    const raw_packet_invalid_no_extlen              = raw_packet_correct.slice(0, 4);
    const raw_packet_invalid_audio_too_short        = raw_packet_correct.slice(0, -1);
    const raw_packet_invalid_audio_too_long         = Uint8Array.of(...raw_packet_correct, 0);  // 0 as an over length byte
    const raw_packet_invalid_silent_audio_too_short = raw_packet_silent_correct.slice(0, -1);
    const raw_packet_invalid_silent_audio_too_long  = Uint8Array.of(...raw_packet_silent_correct, 0); // 0 as an over length byte

    assertEquals(is_audio_packet("")                                       , false); // string "" as non Uint8Array
    assertEquals(is_audio_packet(raw_packet_invalid_empty)                 , false);
    assertEquals(is_audio_packet(raw_packet_invalid_id)                    , false);
    assertEquals(is_audio_packet(raw_packet_invalid_no_extlen)             , false);
    assertEquals(is_audio_packet(raw_packet_invalid_audio_too_short)       , false);
    assertEquals(is_audio_packet(raw_packet_invalid_audio_too_long)        , false);
    assertEquals(is_audio_packet(raw_packet_invalid_silent_audio_too_short), false);
    assertEquals(is_audio_packet(raw_packet_invalid_silent_audio_too_long) , false);

    assertThrows(() => is_audio_packet(""                                       , true), TypeError , "raw_packet must be Uint8Array, but got string");  // string "" as non Uint8Array
    assertThrows(() => is_audio_packet(raw_packet_invalid_empty                 , true), RangeError, "Empty array passed");
    assertThrows(() => is_audio_packet(raw_packet_invalid_id                    , true), RangeError, "It has not an audio packet or silent audio packet type ID");
    assertThrows(() => is_audio_packet(raw_packet_invalid_no_extlen             , true), RangeError, "Too short bytes received, external bytes length missing");
    assertThrows(() => is_audio_packet(raw_packet_invalid_audio_too_short       , true), RangeError, "Too short bytes as audio packet");
    assertThrows(() => is_audio_packet(raw_packet_invalid_audio_too_long        , true), RangeError, "Too long bytes as audio packet");
    assertThrows(() => is_audio_packet(raw_packet_invalid_silent_audio_too_short, true), RangeError, "Too short bytes received, external bytes length missing");
    assertThrows(() => is_audio_packet(raw_packet_invalid_silent_audio_too_long , true), RangeError, "Too long bytes as silent audio packet");
  });
});


Deno.test(async function err_cases(t) {
  await t.step(function enc_invalid_type() {
    const audio_pcm = generate_rand_float32array(ONE_FRAME_SAMPLES);
    const lane_name = "ABC";
    const ext_bytes = new Uint8Array([1,2,3,4]);

    assertThrows(() => packet_audio_encode("", lane_name, ext_bytes), TypeError, "audio_pcm must be Float32Array, but got string");
    //                                     ~~ as non Float32Array
    assertThrows(() => packet_audio_encode(audio_pcm,  1, ext_bytes), TypeError, "lane_name must be string, but got number");
    //                                                 ~ as non string
    assertThrows(() => packet_audio_encode(audio_pcm, lane_name, ""),  TypeError, "ext_bytes must be Uint8Array, but got string");
    //                                                           ~~ as non Uint8Array
  });


  await t.step(function enc_invalid_value() {
    const audio_pcm = generate_rand_float32array(ONE_FRAME_SAMPLES);
    const lane_name = "ABC";
    const ext_bytes = new Uint8Array([1,2,3,4]);

    const lane_name_non_ascii = "🗒";
    const lane_name_over_len = "ABCD";
    const ext_bytes_over_len = new Uint8Array(256);

    assertThrows(() => packet_audio_encode(audio_pcm, lane_name_non_ascii, ext_bytes), RangeError, "For lane_name, non ascii characters are not allowed");
    assertThrows(() => packet_audio_encode(audio_pcm, lane_name_over_len , ext_bytes), RangeError, "For lane_name, over 3 characters string is not allowed");
    assertThrows(() => packet_audio_encode(audio_pcm, lane_name, ext_bytes_over_len ), RangeError, "For ext_bytes, over 255 bytes data is not allowed");
  });


  // await t.step(function dec_invalid_type() {
  //   // packet verification integrated to `is_audio_packet` tests
  // });


  // await t.step(function dec_invalid_value() {
  //   // packet verification integrated to `is_audio_packet` tests
  // });


  // await t.step(function verify_invalid_type() {
  //   // no error cases of `is_audio_packet`
  // });


  // await t.step(function verify_invalid_value() {
  //   // no error cases of `is_audio_packet`
  // });
});
