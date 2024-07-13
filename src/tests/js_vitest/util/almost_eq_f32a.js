/**
 * @file Compare two Float32Array objects with allowing specified error
 *
 * @author aKuad
 */


/**
 * Compare two Float32Array objects with allowing specified error
 *
 * Converting between float32 and int16, it includes error.
 *
 * @param {Float32Array} array1 Array to compare
 * @param {Float32Array} array2 Array to compare
 * @param {number} allow_err Value difference to allow
 * @return {boolean} Equal: true, Otherwise: false
 */
export function is_almost_equal_float32array(array1, array2, allow_err) {
  if(array1.length != array2.length) { return false; }

  for(let i = 0; i < array1.length; i++) {
    if(Math.abs(array1[i] - array2[i]) > allow_err) { return false; }
  }
  return true;
}
