/**
 * @file Generate a random `Float32Array`
 *
 * @author aKuad
 */


/**
 * Generate a random `Float32Array`
 *
 * It can use for test data as random audio.
 *
 * @param {number} elem_count Length of array to generate
 * @returns {Float32Array} Random array
 */
export function generate_rand_float32array(elem_count) {
  return Float32Array.from(new Array(elem_count), e => (Math.random() - 0.5) * 2);
  // - 0.5   --> Random number range is [ -0.5, 0.5)
  // * 2     -->                        [   -1,   1)
}
