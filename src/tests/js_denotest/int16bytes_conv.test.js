/**
 * @file Tests for `int16bytes_conv.js`
 *
 * Test cases:
 *   * Can convert between `Int16Array` and `Uint8Array` in little endian
 *     * Finally, original array and processed array must be equal
 *   * Throw `TypeError` if unexpected type argument passed at all function
 *
 * Test steps:
 *   * Run this script by deno test - `deno test`
 *
 * @author aKuad
 */

import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { int16_to_uint8_little_endian, uint8_to_int16_little_endian } from "../../static/int16bytes_conv.js";


Deno.test(async function true_cases(t) {
  await t.step(function conv() {
    const array_org = new Int16Array([1000, 2000, -3000]);

    const conv_bytes = int16_to_uint8_little_endian(array_org);
    const array_prc = uint8_to_int16_little_endian(conv_bytes);

    assertEquals(array_org, array_prc);
  });
});


Deno.test(async function err_cases(t) {
  await t.step(function invalid_type() {
    assertThrows(() => int16_to_uint8_little_endian(""), TypeError, "int16_array must be a Int16Array, but got string");  // string "" as non Int16Array
    assertThrows(() => uint8_to_int16_little_endian(""), TypeError, "uint8_array must be a Uint8Array, but got string");  // string "" as non Uint8Array
  });
});
