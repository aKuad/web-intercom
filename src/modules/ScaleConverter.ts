/**
 * @file A value conversion between 2 liner scales
 *
 * Conversion image is:
 *
 * -80    0     80 scale_1
 *  |-----|-----|
 *  0   127.5   255 scale_2
 *
 * scale_1 -80 -> scale_2 0
 * scale_1   0 -> scale_2 127.5
 * scale_1  80 -> scale_2 255
 * (also reverse can)
 *
 * @author aKuad
 */


/**
 * A value conversion between 2 liner scales
 */
export class ScaleConverter {
  #s1_l: number;
  #s1_h: number;
  #s2_l: number;
  #s2_h: number;


  /**
   * Construct with scales definitions
   *
   * @param s1_l Scale_1 min range
   * @param s1_h Scale_1 high range
   * @param s2_l Scale_2 min range
   * @param s2_h Scale_2 high range
   * @throws {RangeError} If `s1_l >= s1_h`
   * @throws {RangeError} If `s2_l >= s2_h`
   */
  constructor(s1_l: number, s1_h: number, s2_l: number, s2_h: number) {
    if(s1_l >= s1_h) {
      throw new RangeError(`Must be s1_l < s1_h, but got s1_l (${s1_l}) >= s1_h (${s1_h})`);
    }
    if(s2_l >= s2_h) {
      throw new RangeError(`Must be s2_l < s2_h, but got s2_l (${s2_l}) >= s2_h (${s2_h})`);
    }

    this.#s1_l = s1_l;
    this.#s1_h = s1_h;
    this.#s2_l = s2_l;
    this.#s2_h = s2_h;
  }


  /**
   * Scale conversion from scale_1 to scale_2
   *
   * Note: Under range of scale_1 will be adjusted to scale_2 min value, over will be high value
   *
   * @param value Value to convert
   * @returns Converted value
   */
  s1_to_s2(value: number): number {
    if(value <= this.#s1_l) {
      return this.#s2_l;
    } else if(value >= this.#s1_h) {
      return this.#s2_h;
    }

    // Normalize: means convert value to range 0~1
    const value_normalized = (value - this.#s1_l) / Math.abs(this.#s1_h - this.#s1_l);
    // Then normalized value to scale_2 value
    return value_normalized * Math.abs(this.#s2_h - this.#s2_l) + this.#s2_l;
  }


  /**
   * Scale conversion from scale_2 to scale_1
   *
   * Note: Under range of scale_2 will be adjusted to scale_1 min value, over will be high value
   *
   * @param value Value to convert
   * @returns Converted value
   */
  s2_to_s1(value: number): number {
    if(value <= this.#s2_l) {
      return this.#s1_l;
    } else if(value >= this.#s2_h) {
      return this.#s1_h;
    }

    // Normalize: means convert value to range 0~1
    const value_normalized = (value - this.#s2_l) / Math.abs(this.#s2_h - this.#s2_l);
    // Then normalized value to scale_2 value
    return value_normalized * Math.abs(this.#s1_h - this.#s1_l) + this.#s1_l;
  }
}
