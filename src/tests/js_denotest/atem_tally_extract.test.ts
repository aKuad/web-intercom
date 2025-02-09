/**
 * @file Tests for `atem_tally_extract.ts` module
 *  * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test --allow-env --allow-read --allow-ffi`
 *
 * @author aKuad
 */

import { assertEquals } from "jsr:@std/assert@1";
import { AtemStateUtil } from "npm:atem-connection";

import { atem_tally_extract } from "../../modules/atem_tally_extract.ts";


Deno.test(async function true_cases(t) {
  /**
   * - Test data preparation
   */
  const atem_state = AtemStateUtil.Create();
  const test_data_str = Deno.readTextFileSync("./atem-state-data-video.json");
  const test_data = JSON.parse(test_data_str);
  atem_state.video = test_data.video;

  const me_0 = atem_state.video.mixEffects[0];
  if(!me_0) { throw new Error("Invalid test data - No existing video.mixEffects[0]"); }
  const me_0_usk = me_0.upstreamKeyers[0];
  if(!me_0_usk) { throw new Error("Invalid test data - No existing video.mixEffects[0].upstreamKeyers[0]"); }
  const dsk_0 = atem_state.video.downstreamKeyers[0];
  const dsk_1 = atem_state.video.downstreamKeyers[1];
  if(!dsk_0) { throw new Error("Invalid test data - No existing video.downstreamKeyers[0]"); }
  if(!dsk_1) { throw new Error("Invalid test data - No existing video.downstreamKeyers[1]"); }
  const dsk_0_src = dsk_0.sources;
  const dsk_1_src = dsk_1.sources;
  if(!dsk_0_src) { throw new Error("Invalid test data - No existing video.downstreamKeyers[0].sources"); }
  if(!dsk_1_src) { throw new Error("Invalid test data - No existing video.downstreamKeyers[1].sources"); }

  me_0.previewInput = 0;  // Set all inputs to black (ID: 0) as initial
  me_0.programInput = 0;
  dsk_0.onAir = false;
  dsk_1.onAir = false;
  dsk_0_src.fillSource = 0;
  dsk_1_src.fillSource = 0;


  /**
   * - Can extract M/E preview and program
   *   - Edge case test of ID 32
   */
  await t.step(function me_preview_program() {
    me_0.previewInput = 1;
    me_0.programInput = 2;
    assertEquals(atem_tally_extract(atem_state), [0b1 << 0, 0b1 << 1]);

    me_0.previewInput = 31;
    me_0.programInput = 32;
    assertEquals(atem_tally_extract(atem_state), [0b1 << 30, 0b1 << 31]);

    me_0.previewInput = 33;
    me_0.programInput = 34;
    assertEquals(atem_tally_extract(atem_state), [0b0, 0b0]);

    // Cleanup
    me_0.previewInput = 0;
    me_0.programInput = 0;
  });


  /**
   * - Can extract M/E upstream-keyer fill source
   * - Can ignore M/E upstream-keyer when not on-air
   */
  await t.step(function me_upstream_keyer() {
    me_0_usk.fillSource = 1;
    me_0_usk.onAir = true;
    assertEquals(atem_tally_extract(atem_state), [0b0, 0b1 << 0]);

    me_0_usk.onAir = false;
    assertEquals(atem_tally_extract(atem_state), [0b0, 0b0]);

    // Cleanup
    me_0_usk.fillSource = 0;
    me_0_usk.onAir = false;
  });


  /**
   * - Can extract downstream-keyer fill source
   * - Can ignore downstream-keyer when not on-air
   */
  await t.step(function downstream_keyer() {
    dsk_0_src.fillSource = 1;
    dsk_0.onAir = true;
    assertEquals(atem_tally_extract(atem_state), [0b0, 0b1 << 0]);

    dsk_0.onAir = false;
    assertEquals(atem_tally_extract(atem_state), [0b0, 0b0]);

    dsk_0_src.fillSource = 1;
    dsk_0.onAir = true;
    dsk_1_src.fillSource = 2;
    dsk_1.onAir = true;
    assertEquals(atem_tally_extract(atem_state), [0b0, 0b11]);

    // Cleanup
    dsk_0_src.fillSource = 0;
    dsk_0.onAir = false;
    dsk_1_src.fillSource = 0;
    dsk_1.onAir = false;
  });


  /**
   * - Can extract M/E program, preview, upstream-keyer fill source and downstream-keyer fill source
   */
  await t.step(function multiple() {
    me_0.previewInput = 1;
    me_0.programInput = 2;
    me_0_usk.fillSource = 3;
    me_0_usk.onAir = true;
    dsk_0_src.fillSource = 4;
    dsk_0.onAir = true;
    dsk_1_src.fillSource = 5;
    dsk_1.onAir = true;

    assertEquals(atem_tally_extract(atem_state), [0b1, 0b11110]);

    // Cleanup
    me_0.previewInput = 0;
    me_0.programInput = 0;
    me_0_usk.fillSource = 0;
    me_0_usk.onAir = false;
    dsk_0_src.fillSource = 0;
    dsk_0.onAir = false;
    dsk_1_src.fillSource = 0;
    dsk_1.onAir = false;
  });
});
