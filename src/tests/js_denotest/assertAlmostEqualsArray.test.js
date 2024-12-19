/**
 * @file Tests for `assertAlmostEqualArray.js` module
 *
 * Test cases:
 *   * Not throw if all elements error in tolerance between 2 array
 *   * Throw AssertionError if 2 array length is not equal
 *   * Throw AssertionError if any element has error over than specified tolerance
 *
 * Test steps:
 *   * Run this script by deno test - `deno test`
 *
 * @author aKuad
 */

import { assertThrows, AssertionError } from "jsr:@std/assert@1";

import { assertAlmostEqualsArray } from "./test-util/assertAlmostEqualsArray.js";


Deno.test(async function true_cases(t) {
  await t.step(function assert_ok() {
    const array_actual   = [1.1, 2.2, 3.3];
    const array_expected = [1.1, 2.2, 3.3];

    assertAlmostEqualsArray(array_actual, array_expected);  // expected to not thrown anything
  });


  await t.step(function assert_ng() {
    const array_original = [1.1, 2.2, 3.3];
    const array_length_mismatch = [1.1, 2.2];
    const array_has_error = [1.1, 2.2, 3.5];
    const tolerance = 0.1;

    assertThrows(() => assertAlmostEqualsArray(array_length_mismatch, array_original, tolerance), AssertionError, `Length mismatch:\nactual.length  : ${array_length_mismatch.length}\nexpected.length: ${array_original.length}`);
    assertThrows(() => assertAlmostEqualsArray(array_has_error      , array_original, tolerance), AssertionError);  // Too complex error message, check skipped
  });
});


// Deno.test(async function err_cases(t) {
//   // no error cases of `assertAlmostEqualsArray`
// });
