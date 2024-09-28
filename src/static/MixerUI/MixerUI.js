/**
 * @file Audio mixer fader & meter UI component
 *
 * @author aKuad
 */

import { typeof_detail } from "../typeof_detail.js";


/**
 * Audio mixer fader & meter UI component
 */
export class MixerUI {
  /**
   * Element to view UI
   *
   * @type {HTMLElement}
   */
  #base_container;


  /**
   * Callback function for fader moved (value updated)
   *
   * @type {callback_on_fader_moved | null}
   */
  #callback_on_fader_moved;


  /**
   * Constructor of MixerUI
   *
   * @param {HTMLElement} base_container HTML element to view UI
   */
  constructor(base_container) {
    this.#base_container = base_container;
    this.#callback_on_fader_moved = null;

    this.#base_container.classList.add("MixerUI-base");

    document.addEventListener("keydown", e => {
      if(e.code == "ArrowUp") {
        e.preventDefault();
        this.#move_active_lane(false);
      } else if(e.code == "ArrowDown") {
        e.preventDefault();
        this.#move_active_lane(true);
      }
    });
  }


  /**
   * Create a lane with specified lane ID
   *
   * @param {string} lane_name Lane name to view
   * @param {number} lane_id Lane ID of new lane, must not be duplicated
   *
   * @throws {TypeError} If `lane_name` is not `string`
   * @throws {RangeError} If `lane_name` is empty `string`
   * @throws {RangeError} If `lane_name` has non ascii or control ascii characters
   * @throws {RangeError} If `lane_name` has over 3 characters
   * @throws {RangeError} If specified `lane_id` is already existing
   */
  create_lane(lane_name, lane_id) {
    // Argument lane_name type/value checking
    if(typeof lane_name !== "string") {
      throw new TypeError(`lane_name must be string, but got ${typeof_detail(lane_name)}`);
    }
    if(lane_name.length === 0) {
      throw new RangeError("lane_name can't be empty string");
    }
    if(!(/^[\x20-\x7F]*$/.test(lane_name))) {
      throw new RangeError("For lane_name, non ascii or control ascii characters are not allowed");
    }
    if(lane_name.length > 3) {
      throw new RangeError(`For lane_name, over 3 characters string is not allowed, but got ${lane_name.length} characters`);
    }

    // Lane ID existing check
    if(this.#get_lane_from_id(lane_id, false) !== null) {
      throw new RangeError(`lane_id ${lane_id} is already existing`);
    }

    const lane = this.#create_lane_element(lane_name, lane_id);
    const moved_callback = this.#callback_on_fader_moved;
    lane.getElementsByClassName("MixerUI-lane-fader-input")[0].addEventListener("input", e => {
      if(moved_callback !== null) moved_callback(lane_id, e.target.value);
    });

    this.#base_container.appendChild(lane);
  }


  /**
   * Delete a lane by lane ID
   *
   * @param {number} lane_id Lane ID to delete
   */
  delete_lane(lane_id) {
    this.#get_lane_from_id(lane_id).remove();
  }


  /**
   * @callback callback_on_fader_moved It will be called when fader moved
   * @param {number} lane_id Lane ID of fader moved
   * @param {number} moved_value Moved value of fader (0~255)
   */

  /**
   * Set callback function of fader moved
   *
   * @param {callback_on_fader_moved} callback_on_fader_moved Callback function of fader moved
   */
  set_callback_on_fader_moved(callback_on_fader_moved) {
    // Argument type checking
    if(typeof(callback_on_fader_moved) !== "function") {
      throw new TypeError(`callback_on_fader_moved must be function, but got ${typeof_detail(callback_on_fader_moved)}`);
    }

    this.#callback_on_fader_moved = callback_on_fader_moved;
  }


  /**
   * Change a lane's fader value
   *
   * @param {number} lane_id Lane ID to change fader
   * @param {number} value New value of fader
   *
   * @throws {TypeError} If `value` is not `num`
   * @throws {RangeError} If `value` is not in 0~255
   */
  set_fader_value(lane_id, value) {
    // Argument type/range checking
    if(typeof(value) !== "number") {
      throw new TypeError(`value must be number, but got ${typeof_detail(value)}`);
    }
    if(value < 0 || value > 255) {
      throw new RangeError(`value must be in 0~255, but got ${value}`);
    }

    const lane = this.#get_lane_from_id(lane_id);
    const fader = lane.getElementsByClassName("MixerUI-lane-fader-input")[0];
    fader.value = value;
  }


  /**
   * Change a lane's meter value
   *
   * @param {number} lane_id Lane ID to change meter
   * @param {number} value New value of meter
   *
   * @throws {TypeError} If `value` is not `num`
   * @throws {RangeError} If `value` is not in 0~255
   */
  set_meter_value(lane_id, value) {
    // Argument type/range checking
    if(typeof(value) !== "number") {
      throw new TypeError(`value must be number, but got ${typeof_detail(value)}`);
    }
    if(value < 0 || value > 255) {
      throw new RangeError(`value must be in 0~255, but got ${value}`);
    }

    const lane = this.#get_lane_from_id(lane_id);
    const meter = lane.getElementsByClassName("MixerUI-lane-meter-value")[0];
    meter.style.width = `${value / 255 * 100}%`;
  }


  /**
   * Create a new lane element - helper function of `create_lane`
   *
   * @param {name} name Lane name to view
   * @param {number} lane_id Lane ID of new lane
   * @returns {HTMLDivElement}
   */
  #create_lane_element(name, lane_id) {
    const lane = document.createElement("div");
    lane.classList.add("MixerUI-container");
    lane.lane_id = lane_id;

    const lane_name = document.createElement("div");
    lane_name.classList.add("MixerUI-lane-name");
    lane_name.innerText = name;
    lane.appendChild(lane_name);

    const lane_fader = document.createElement("div");
    lane_fader.classList.add("MixerUI-lane-fader");
    const lane_fader_input = document.createElement("input");
    lane_fader_input.classList.add("MixerUI-lane-fader-input");
    lane_fader_input.type = "range";
    lane_fader_input.min = 0;
    lane_fader_input.max = 255;
    lane_fader_input.value = 127;
    lane_fader.appendChild(lane_fader_input);
    lane.appendChild(lane_fader);

    const lane_meter = document.createElement("div");
    lane_meter.classList.add("MixerUI-lane-meter");
    const lane_meter_active = document.createElement("div");
    lane_meter_active.classList.add("MixerUI-lane-meter-value");
    lane_meter.appendChild(lane_meter_active);
    lane.appendChild(lane_meter);

    return lane;
  }


  /**
   * Get lane container object from lane ID
   *
   * @param {number} lane_id Lane ID to get HTML element of lane container
   * @returns {HTMLDivElement | null} HTML element of lane, or null (if not existing lane_id specified)
   *
   * @throws {TypeError} If `lane_id` is not `num`
   * @throws {RangeError} If `lane_id` is not in 0~255
   */
  #get_lane_from_id(lane_id, throw_on_non_existing = true) {
    // Argument type/range checking
    if(typeof(lane_id) !== "number") {
      throw new TypeError(`lane_id must be number, but got ${typeof_detail(lane_id)}`)
    }
    if(lane_id < 0 || lane_id > 255) {
      throw new RangeError(`lane_id must be in 0~255, but got ${lane_id}`);
    }

    const lanes = Array.from(this.#base_container.getElementsByClassName("MixerUI-container"));
    const matched_lane = lanes.filter(e => e.lane_id === lane_id);

    if(matched_lane.length === 0) {
      if(throw_on_non_existing) {
        throw new RangeError(`The lane id ${lane_id} is not existing`);
      } else {
        return null;
      }
    }

    return matched_lane[0];
  }


  /**
   * Change focus of fader to forward or backward from current focused fader
   *
   * Note: No argument type checking, because it is internal function and very simple argument
   *
   * @param {boolean} is_forward true: move to forward (is bottom direction of screen), false: backward
   */
  #move_active_lane(is_forward) {
    const fader_elements = this.#base_container.getElementsByClassName("MixerUI-lane-fader-input");
    if(fader_elements.length === 0) {
      return; // no lanes available, do nothing
    }

    const active_lane_index = Array.from(fader_elements).indexOf(document.activeElement);
    if(active_lane_index === -1) {  // no lanes focused
      fader_elements[0].focus();
      return;
    }

    if(is_forward) {
      if(active_lane_index === fader_elements.length-1) { return; } // first lane focused, do nothing
      fader_elements[active_lane_index + 1].focus();
    } else {
      if(active_lane_index === 0) { return; } // last lane focused, do nothing
      fader_elements[active_lane_index - 1].focus();
    }
  }
}