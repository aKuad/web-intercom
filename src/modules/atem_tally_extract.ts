/**
 * @file ATEM preview/program sources extraction function for tally light
 *
 * @author aKuad
 */

import { AtemState } from "npm:atem-connection";


/**
 * Extract preview/program and downstream-keyer fill-source using input sources from AtemState object
 *
 * Return 'in bits' means, for-example: using source 3, then returns 0b0000100
 * 
 * Note: Support sources for ID 1~32, over or under then will be ignored
 *
 * @param atem_state ATEM state object to extract
 * @returns [0]: Preview using sources in bits, [1]: Program using sources in bits
 */
export function atem_tally_extract(atem_state: AtemState): number[] {
  const preview_sources = new Array<number>();
  const program_sources = new Array<number>();

  // Input sources extraction from M/Es
  atem_state.video.mixEffects.forEach(mix_effect => {
    // deno-coverage-ignore-next
    if(!mix_effect) { return; } // For remove type inference of undefined
    preview_sources.push(mix_effect.previewInput);
    program_sources.push(mix_effect.programInput);

    mix_effect.upstreamKeyers.forEach(upstream_keyer => {
      // deno-coverage-ignore-next
      if(!upstream_keyer) { return; }       // For remove type inference of undefined
      if(!upstream_keyer.onAir) { return; } // Ignore when non on-air
      program_sources.push(upstream_keyer.fillSource);
    });
  });

  // Input sources extraction from downstream keyers
  atem_state.video.downstreamKeyers.forEach(downstream_keyer => {
    // deno-coverage-ignore-next
    if(!downstream_keyer) { return; }         // For remove type inference of undefined
    if(!downstream_keyer.onAir) { return; }   // Ignore when non on-air
    // deno-coverage-ignore-next
    if(!downstream_keyer.sources) { return; } // For remove type inference of undefined
    program_sources.push(downstream_keyer.sources.fillSource);
  });

  // Only pass camera inputs ... No support for black (ID 0) and other inputs (ID >=1000)
  // Note: JavaScript number type is 32bit, so cut over than 32 ID
  const preview_sources_filtered = preview_sources.filter(value => (1 <= value && value <= 32));
  const program_sources_filtered = program_sources.filter(value => (1 <= value && value <= 32));

  // Convert source ID array to bit array
  const preview_sources_bit = preview_sources_filtered.reduce((prev, curr) => prev | (0b1 << (curr-1)), 0);
  const program_sources_bit = program_sources_filtered.reduce((prev, curr) => prev | (0b1 << (curr-1)), 0);

  return [preview_sources_bit, program_sources_bit];
}
