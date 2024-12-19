/**
 * @file Compare two Float32Array objects with allowing specified error
 *
 * @author aKuad
 */

import { assertAlmostEquals, AssertionError } from "jsr:@std/assert@1";


/**
 * Compare two Float32Array objects with allowing specified error
 *
 * @param {Array} actual The actual array to compare
 * @param {Array} expected The expected array to compare
 * @param {number} tolerance The tolerance to consider the values almost equal
 *
 * @throws {AssertionError} If length of `actual` and `expected` is not equal
 * @throws {AssertionError} If any element has error over than `tolerance`
 */
export function assertAlmostEqualsArray(actual, expected, tolerance) {
  if(actual.length !== expected.length) {
    throw new AssertionError(`Length mismatch:\nactual.length  : ${actual.length}\nexpected.length: ${expected.length}`);
  }

  for(let i = 0; i < actual.length; i++) {
    assertAlmostEquals(actual[i], expected[i], tolerance);
  }
}
