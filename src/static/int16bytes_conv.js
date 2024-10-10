/**
 * @file Conversion between `Int16Array` and `Uint8Array` without system dependency
 *
 * @author aKuad
 */

import { typeof_detail } from "./typeof_detail.js";


/**
 * Convert from Int16Array to `Uint8Array` as little endian, without dependency of system
 *
 * @param {Int16Array} int16_array Array to convert to `Uint8Array`
 * @return {Uint8Array} Converted array
 */
export function int16_to_uint8_little_endian(int16_array) {
  // Arguments type checking
  if(!(int16_array instanceof Int16Array)) {
    throw new TypeError(`int16_array must be a Int16Array, but got ${typeof_detail(int16_array)}`);
  }

  const int16_array_little = new Int16Array(int16_array.length);
  const int16_array_little_view = new DataView(int16_array_little.buffer);
  int16_array.forEach((value, index) => int16_array_little_view.setInt16(index * 2, value, true));
  //                                                          int16 is 2 bytes ~~~         ~~~~ write as little endian

  return new Uint8Array(int16_array_little.buffer);
}


/**
 * Convert from `Uint8Array` to `Int16Array` as little endian, without dependency of system
 *
 * @param {Uint8Array} uint8_array Array to convert to `Int16Array`
 * @returns {Int16Array} Converted array
 */
export function uint8_to_int16_little_endian(uint8_array) {
  // Arguments type checking
  if(!(uint8_array instanceof Uint8Array)) {
    throw new TypeError(`uint8_array must be a Uint8Array, but got ${typeof_detail(uint8_array)}`);
  }

  const int16_array_little = new Int16Array(uint8_array.buffer);
  const int16_array_little_view = new DataView(int16_array_little.buffer);
  const int16_array = new Int16Array(int16_array_little);

  for(let i = 0; i < int16_array_little.length; i++) {
    int16_array[i] = int16_array_little_view.getInt16(i * 2, true);
    //                            int16 is 2 bytes ~~~  ~~~~ read as little endian
  }

  return int16_array;
}


// For big endian is not implemented, because of unnecessary now
// export function int16_to_uint8_little_endian(int16_array) {}
// export function uint8_to_int16_little_endian(uint8_array) {}
