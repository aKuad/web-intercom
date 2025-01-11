/**
 * @file Tests for `ScaleConverter.ts` module
 *  * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test **Test*.ts`
 *
 * @author aKuad
 */

import { assertEquals, assertAlmostEquals, assertThrows } from "jsr:@std/assert@1";

import { ScaleConverter } from "../../modules/ScaleConverter.ts";


Deno.test(async function true_cases(t) {
  /**
   * - Can convert a value from scale_1 to scale_2 (also reversed)
   */
  await t.step(function conversion() {
    const scale_converter = new ScaleConverter(-80, 80, 0, 255);

    console.log(`Scale conversion: 127 -> ${scale_converter.s2_to_s1(127)}`);
    console.log(`Scale conversion: 128 -> ${scale_converter.s2_to_s1(128)}`);

    // scale_1 to scale_2 conversion
    assertEquals(scale_converter.s1_to_s2(-81),   0); // under range conversion
    assertEquals(scale_converter.s1_to_s2(-80),   0);
    assertEquals(scale_converter.s1_to_s2(  0), 127.5);
    assertEquals(scale_converter.s1_to_s2( 80), 255);
    assertEquals(scale_converter.s1_to_s2( 81), 255); // over range conversion

    // scale_2 to scale_1 conversion
    assertEquals      (scale_converter.s2_to_s1( -1),     -80); // under range conversion
    assertEquals      (scale_converter.s2_to_s1(  0),     -80);
    assertAlmostEquals(scale_converter.s2_to_s1(127), -0.3137, 0.0001);
    assertAlmostEquals(scale_converter.s2_to_s1(128),  0.3137, 0.0001);
    assertEquals      (scale_converter.s2_to_s1(255),      80);
    assertEquals      (scale_converter.s2_to_s1(256),      80); // over range conversion
  });
});


Deno.test(async function err_cases(t) {
  /**
   * - Scale definition must be `s1_l < s1_h`
   * - Scale definition must be `s2_l < s2_h`
   */
  await t.step(function invalid_scale_definition() {
    assertThrows(() => new ScaleConverter(  1,  0, 0, 255), RangeError, "Must be s1_l < s1_h, but got s1_l (1) >= s1_h (0)"); // scale min is grater than high
    assertThrows(() => new ScaleConverter(  0,  0, 0, 255), RangeError, "Must be s1_l < s1_h, but got s1_l (0) >= s1_h (0)"); // scale range is 0
    assertThrows(() => new ScaleConverter(-80, 80, 1,   0), RangeError, "Must be s2_l < s2_h, but got s2_l (1) >= s2_h (0)"); // scale min is grater than high
    assertThrows(() => new ScaleConverter(-80, 80, 0,   0), RangeError, "Must be s2_l < s2_h, but got s2_l (0) >= s2_h (0)"); // scale range is 0
  });
});
