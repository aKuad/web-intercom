/**
 * @file Tests for `AudioMixer.ts` module
 *  * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test`
 *
 * @author aKuad
 */

import { assertEquals, assertAlmostEquals, assertThrows } from "jsr:@std/assert@1";
import { generate_rand_float32array } from "./test-util/rand_f32a.js";

import { AudioMixer, MaxLanesReachedError, NonExistingLaneIdError } from "../../modules/AudioMixer.ts";
import { ONE_FRAME_SAMPLES } from "../../static/AUDIO_PARAM.js";
import { LaneInfo } from "../../static/packet_conv/LaneInfo.js";
import { LaneLoudness } from "../../static/packet_conv/LaneLoudness.js";
import { dbfs_float } from "../../static/util/dbfs.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can MIX multiple PCM
   */
  await t.step(function audio_mixing() {
    const audio_mixer = new AudioMixer();
    const lane_id_0 = audio_mixer.create_lane();
    const lane_id_1 = audio_mixer.create_lane();
    const lane_id_2 = audio_mixer.create_lane();

    const input_pcm_0 = generate_rand_float32array(ONE_FRAME_SAMPLES);
    input_pcm_0[0] = 0.0;
    input_pcm_0[1] = 0.5;
    input_pcm_0[2] = 0.125;
    const input_pcm_1 = generate_rand_float32array(ONE_FRAME_SAMPLES);
    input_pcm_1[0] = 0.125;
    input_pcm_1[1] = 0.25;
    input_pcm_1[2] = 0.5;
    const silent_pcm = new Float32Array(ONE_FRAME_SAMPLES);

    audio_mixer.lane_io(lane_id_0, input_pcm_0, "L0");
    audio_mixer.lane_io(lane_id_1, input_pcm_1, "L1");
    const mixed_pcm = audio_mixer.lane_io(lane_id_2, silent_pcm, "L2");

    assertAlmostEquals(mixed_pcm[0], 0.125);
    assertAlmostEquals(mixed_pcm[1], 0.75 );
    assertAlmostEquals(mixed_pcm[2], 0.625);
  });


  /**
   * - Sample values over 1 clipped to 1
   * - Sample values under -1 clipped to -1
   */
  await t.step(function audio_mixing_clipping() {
    const audio_mixer = new AudioMixer();
    const lane_id_0 = audio_mixer.create_lane();
    const lane_id_1 = audio_mixer.create_lane();
    const lane_id_2 = audio_mixer.create_lane();

    const input_pcm_0 = generate_rand_float32array(ONE_FRAME_SAMPLES);
    input_pcm_0[0] =  0.9;
    input_pcm_0[1] = -0.9;
    const input_pcm_1 = generate_rand_float32array(ONE_FRAME_SAMPLES);
    input_pcm_1[0] =  0.2;
    input_pcm_1[1] = -0.2;
    const silent_pcm = new Float32Array(ONE_FRAME_SAMPLES);

    audio_mixer.lane_io(lane_id_0, input_pcm_0, "L0");
    audio_mixer.lane_io(lane_id_1, input_pcm_1, "L1");
    const mixed_pcm = audio_mixer.lane_io(lane_id_2, silent_pcm, "L2");

    assertAlmostEquals(mixed_pcm[0],  1);
    assertAlmostEquals(mixed_pcm[1], -1);
  });


  /**
   * - Can gain input PCM
   */
  await t.step(function audio_gain() {
    const audio_mixer = new AudioMixer();
    const lane_id_0 = audio_mixer.create_lane();
    const lane_id_1 = audio_mixer.create_lane();

    const input_pcm = generate_rand_float32array(ONE_FRAME_SAMPLES).map(e => e * 0.1);
    // Apply gain -20[dB] = 10 ** (-20/20) = 0.1
    // Then dBFS be less than -20
    const input_pcm_pos20db = input_pcm.map(e => e * 10);   // Apply gain +20[dB]
    const input_pcm_neg20db = input_pcm.map(e => e * 0.1);  // Apply gain -20[dB]
    const silent_pcm = new Float32Array(ONE_FRAME_SAMPLES);

    let gained_pcm: Float32Array;

    audio_mixer.set_lane_gain_db(lane_id_0, 20);
    audio_mixer.lane_io(lane_id_0, input_pcm, "L0");
    gained_pcm = audio_mixer.lane_io(lane_id_1, silent_pcm, "L1");
    assertEquals(gained_pcm, input_pcm_pos20db);

    audio_mixer.set_lane_gain_db(lane_id_0, -20);
    audio_mixer.lane_io(lane_id_0, input_pcm, "L0");
    gained_pcm = audio_mixer.lane_io(lane_id_1, silent_pcm, "L1");
    assertEquals(gained_pcm, input_pcm_neg20db);
  });


  /**
   * - Can get all lanes info (is lane ID, lane name and current gain)
   */
  await t.step(function lanes_info() {
    const audio_mixer = new AudioMixer();
    const lane_id_0 = audio_mixer.create_lane();
    const lane_id_1 = audio_mixer.create_lane();

    const input_random_pcm = generate_rand_float32array(ONE_FRAME_SAMPLES).map(e => e * 0.1);

    audio_mixer.set_lane_gain_db(lane_id_0, 10.0);
    audio_mixer.set_lane_gain_db(lane_id_1, -5.0);
    audio_mixer.lane_io(lane_id_0, input_random_pcm, "L0");
    audio_mixer.lane_io(lane_id_1, input_random_pcm, "L1");

    const lanes_info_expected = [
      new LaneInfo(lane_id_0, "L0", 10.0),
      new LaneInfo(lane_id_1, "L1", -5.0)
    ];
    const lanes_info_actual = audio_mixer.get_lanes_info();

    assertEquals(lanes_info_actual, lanes_info_expected);
  });


  /**
   * - Can output lanes dBFS
   */
  await t.step(function calc_dbfs() {
    const audio_mixer = new AudioMixer();
    const lane_id_0 = audio_mixer.create_lane();
    const lane_id_1 = audio_mixer.create_lane();

    const input_pcm_0 = generate_rand_float32array(ONE_FRAME_SAMPLES);
    const input_pcm_1 = generate_rand_float32array(ONE_FRAME_SAMPLES);
    const input_dbfs_0 = dbfs_float(input_pcm_0);
    const input_dbfs_1 = dbfs_float(input_pcm_1);

    audio_mixer.lane_io(lane_id_0, input_pcm_0, "L0");
    audio_mixer.lane_io(lane_id_1, input_pcm_1, "L1");

    const expected_lanes_dbfs: LaneLoudness[] = [
      new LaneLoudness(lane_id_0, input_dbfs_0),
      new LaneLoudness(lane_id_1, input_dbfs_1)
    ];

    assertEquals(audio_mixer.get_lanes_dbfs(), expected_lanes_dbfs);
  });


  /**
   * - Ignore too small input for mixing
   */
  await t.step(function silent_input() {
    const audio_mixer = new AudioMixer(300, -20); // set `silent_threshold_dbfs` -20[dBFS]
    const lane_id_0 = audio_mixer.create_lane();
    const lane_id_1 = audio_mixer.create_lane();

    const input_small_pcm = generate_rand_float32array(ONE_FRAME_SAMPLES).map(e => e * 0.1);
    // Apply gain -20[dB] = 10 ** (-20/20) = 0.1
    // Then dBFS be less than silent threshold
    audio_mixer.lane_io(lane_id_0, input_small_pcm, "L0");

    const silent_pcm = new Float32Array(ONE_FRAME_SAMPLES);
    const mixed_pcm = audio_mixer.lane_io(lane_id_1, silent_pcm, "L1");

    assertEquals(mixed_pcm, silent_pcm);
  });


  /**
   * - Ignore no recent input lane (old PCM) for mixing
   */
  await t.step(async function no_recent_input() {
    const audio_mixer = new AudioMixer(10); // No input detect duration shorten
    const lane_id_0 = audio_mixer.create_lane();
    const lane_id_1 = audio_mixer.create_lane();

    const input_random_pcm = generate_rand_float32array(ONE_FRAME_SAMPLES);
    audio_mixer.lane_io(lane_id_0, input_random_pcm, "L0");

    await new Promise<void>((resolve, _) => setTimeout(resolve, 20)); // Make delay 20[ms] (over than 10[ms])

    const silent_pcm = new Float32Array(ONE_FRAME_SAMPLES);
    const mixed_pcm = audio_mixer.lane_io(lane_id_1, silent_pcm, "L1");

    assertEquals(mixed_pcm, silent_pcm);
  });


  /**
   * - Can dispatch `lane-created` event with a `LaneInfo` passing at lane created
   */
  await t.step(function lane_created_event() {
    const audio_mixer = new AudioMixer();

    let actual_lane_info  : LaneInfo = new LaneInfo(0, "DUM", 0.0); // Dummy LaneInfo for prevent used before been assigned error
    audio_mixer.addEventListener("lane-created", {handleEvent: (e: MessageEvent<LaneInfo>) => {
      actual_lane_info = e.data;
    }});
    const lane_id = audio_mixer.create_lane();

    const expected_lane_info = new LaneInfo(lane_id, "NEW" , 0.0);
    assertEquals(actual_lane_info, expected_lane_info);
  });


  /**
   * - Can dispatch `lane-name-modified` event with a `LaneInfo` passing at lane name modified
   */
  await t.step(function lane_name_modified_event() {
    const audio_mixer = new AudioMixer();
    const silent_pcm = new Float32Array(ONE_FRAME_SAMPLES);

    let actual_lane_info  : LaneInfo = new LaneInfo(0, "DUM", 0.0); // Dummy LaneInfo for prevent used before been assigned error
    audio_mixer.addEventListener("lane-name-modified", {handleEvent: (e: MessageEvent<LaneInfo>) => {
      actual_lane_info = e.data;
    }});
    const lane_id = audio_mixer.create_lane();
    audio_mixer.lane_io(lane_id, silent_pcm, "L0"); // set any modified name

    const expected_lane_info = new LaneInfo(lane_id, "L0" , 0.0);
    assertEquals(actual_lane_info, expected_lane_info);
  });


  /**
   * - Can dispatch `lane-deleted` event with a `lane_id` passing at lane deleted
   */
  await t.step(function lane_deleted_event() {
    const audio_mixer = new AudioMixer();

    let actual_lane_id: number = 255; // Dummy lane ID for prevent used before been assigned error
    audio_mixer.addEventListener("lane-deleted", {handleEvent: (e: MessageEvent<number>) => {
      actual_lane_id = e.data;
    }});
    const expected_lane_id = audio_mixer.create_lane();
    audio_mixer.delete_lane(expected_lane_id);

    assertEquals(actual_lane_id, expected_lane_id);
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - Constructor parameter `no_input_detect_msec` allowed positive values
   * - Constructor parameter `silent_threshold_dbfs` allowed negative values
   */
  await t.step(function invalid_argument_constructor() {
    assertThrows(() => new AudioMixer(-1      ), RangeError, "no_input_detect_sec must be positive, but got -1");
    assertThrows(() => new AudioMixer(300, 0.1), RangeError, "silent_threshold_dbfs must be negative, but got 0.1");
  });


  /**
   * - Lane can't create over than 255
   */
  await t.step(function max_lanes_reached() {
    const audio_mixer = new AudioMixer();
    for(let i = 0; i < 256; i++) {
      audio_mixer.create_lane();
    }

    assertThrows(() => audio_mixer.create_lane(), MaxLanesReachedError, "Already reached to maximum lane count");
  });


  /**
   * - Throw when non existing lane ID specified
   */
  await t.step(function non_existing_lane_id() {
    const audio_mixer = new AudioMixer();

    // After instantiation, no lanes
    assertThrows(() => audio_mixer.set_lane_gain_db(0, 0.0), NonExistingLaneIdError, "The lane id 0 is not existing");

    // Create and delete lane, then no existing
    const lane_id = audio_mixer.create_lane();
    audio_mixer.set_lane_gain_db(lane_id, 0.0);
    audio_mixer.delete_lane(lane_id);
    assertThrows(() => audio_mixer.set_lane_gain_db(0, 0.0), NonExistingLaneIdError, "The lane id 0 is not existing");
  });


  /**
   * - Throw when invalid lane ID specified
   */
  await t.step(function invalid_lane_id() {
    const audio_mixer = new AudioMixer();

    assertThrows(() => audio_mixer.delete_lane(256), RangeError, "lane_id must be in 0~255, but got 256");
    assertThrows(() => audio_mixer.delete_lane( -1), RangeError, "lane_id must be in 0~255, but got -1");
  });


  /**
   * - PCM sample count must be equal to `ONE_FRAME_SAMPLES` in `AUDIO_PARAM.js`
   */
  await t.step(function invalid_frame_sample_count() {
    const audio_mixer = new AudioMixer();
    const lane_id = audio_mixer.create_lane();

    const invalid_pcm_short = new Float32Array(ONE_FRAME_SAMPLES - 1);
    const invalid_pcm_long  = new Float32Array(ONE_FRAME_SAMPLES + 1);

    assertThrows(() => audio_mixer.lane_io(lane_id, invalid_pcm_short, "L0"), RangeError, `Unexpected frame sample count - expected ${ONE_FRAME_SAMPLES}, but got ${ONE_FRAME_SAMPLES - 1}`);
    assertThrows(() => audio_mixer.lane_io(lane_id, invalid_pcm_long , "L0"), RangeError, `Unexpected frame sample count - expected ${ONE_FRAME_SAMPLES}, but got ${ONE_FRAME_SAMPLES + 1}`);
  });
});
