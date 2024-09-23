/**
 * @file Tests for `typeof_detail.js` module
 *
 * About test cases, see each test step function comment
 *
 * Test steps:
 *   * Run this script by deno test - `deno test **Test*.js`
 *
 * @author aKuad
 */

import { assertEquals } from "jsr:@std/assert@1";

import { typeof_detail } from "../../static/typeof_detail.js";


Deno.test(async function true_cases(t) {
  /**
   * - Can return primitive object type name
   *   - For null, must return "null", is not same behavior as `typeof`
   */
  await t.step(function primitive_types() {
    assertEquals(typeof_detail()            , "undefined");
    assertEquals(typeof_detail(null)        , "null");
    assertEquals(typeof_detail(true)        , "boolean");
    assertEquals(typeof_detail(1)           , "number");
    assertEquals(typeof_detail(1n)          , "bigint");
    assertEquals(typeof_detail("a")         , "string");
    assertEquals(typeof_detail(Symbol())    , "symbol");
    assertEquals(typeof_detail(assertEquals), "function");
  });


  /**
   * - Can return builtin object name
   */
  await t.step(function builtin_objects() {
    assertEquals(typeof_detail([])              , "Array");
    assertEquals(typeof_detail(new Uint8Array()), "Uint8Array");
    assertEquals(typeof_detail(new Blob())      , "Blob");
  });


  /**
   * - Can return custom class name
   * - Can return "Object" for basic object (is not builtin, not custom class)
   */
  await t.step(function custom_objects() {
    class CustomClass {
      constructor() {};
    }

    assertEquals(typeof_detail(new CustomClass), "CustomClass")
    assertEquals(typeof_detail({})             , "Object");
  });
});
