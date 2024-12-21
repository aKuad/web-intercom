/**
 * @file `assertThrows` in `jsr:@std/assert@1` for ecma script (on browser)
 *
 * @author aKuad
 */


/**
 * `assertThrows` in `jsr:@std/assert@1` for ecma script (on browser)
 *
 * Original `assertThrows` is for server side runtime (e.g. Deno, Node.js, and so on).
 * It is not working on ecma script (on browser).
 *
 * So this function is partly implementation of `assertThrows` for browser ecma script.
 *
 * Usage is same as original `assertThrows` (but not fully compatible)
 *
 * @param {function} fn The function to execute.
 * @param {Error} ErrorClass The error class to assert.
 * @param {string} msgIncludes The string that should be included in the error message.
 */
export function assertThrows_ecma(fn, ErrorClass, mesIncludes) {
  try {
    fn();
    console.log(`--- NG - No error thrown`);
  } catch(e) {
    if(!(e instanceof ErrorClass)) {
      console.log(`--- NG - Unexpected error type`);
      console.log("expected:", ErrorClass.name);
      console.log("actual:", e.name);
      return;
    }

    if(!(e.message.includes(mesIncludes))) {
      console.log(`--- NG - Unexpected error message`);
      console.log(`expected including: ${mesIncludes}`);
      console.log(`actual: ${e.message}`);
      return;
    }

    console.log(`--- OK`);
  }
}
