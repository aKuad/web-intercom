/**
 * @file Improved typeof - get type name or object name
 *
 * @author aKuad
 */

/**
 * Improved typeof - get type name or object name
 *
 * @param {*} obj Object to check type or object name
 * @returns Type or object name
 */
export function typeof_detail(obj) {
  // null is special case
  if(obj === null) {
    return "null";
  }

  // primitive type
  const obj_typeof = typeof obj;
  if(obj_typeof !== "object") {
    return obj_typeof;
  }

  // constructor name
  return obj.constructor.name;
}
