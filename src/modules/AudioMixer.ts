/**
 * @file Audio mixer module
 *
 * Audio mixing, with ignoring own input and no recent input (suppose unstable connection).
 *
 * @author aKuad
 */

import { ONE_FRAME_SAMPLES } from "../static/AUDIO_PARAM.js";
import { dbfs_float } from "../static/util/dbfs.js";
import { LaneInfo } from "../static/packet_conv/LaneInfo.js";
import { LaneLoudness } from "../static/packet_conv/LaneLoudness.js";


/**
 * Data structure for mixer lane
 */
class AudioMixerLane {
  pcm: Float32Array;
  lane_name: string;
  gain_db: number;
  last_input_ts: number;
  dbfs: number;

  /**
   * Data structure of a lane data, parameters and status
   *
   * @param pcm Data - PCM
   * @param lane_name Parameter - lane name (expected 1~3 characters, but not test in this class)
   * @param gain_db Parameter - gain, volume control of the lane
   * @param last_input_ts Status - last input time stamp
   * @param dbfs Status - lane loudness in dBFS
   */
  constructor(pcm: Float32Array, lane_name: string, gain_db: number, last_input_ts: number, dbfs: number) {
    this.pcm = pcm;
    this.lane_name = lane_name;
    this.gain_db = gain_db;
    this.last_input_ts = last_input_ts;
    this.dbfs = dbfs;
  }
}


/**
 * Throw when try to create over #MAX_LANE_COUNT lanes
 *
 * Empty definition, because it for custom named error
 */
export class MaxLanesReachedError extends Error {}


/**
 * Throw when non existing lane_id specified
 *
 * Empty definition, because it for custom named error
 */
export class NonExistingLaneIdError extends Error {}


/**
 * Audio mixer module
 */
export class AudioMixer extends EventTarget{
  /**
   * Maximum number of lanes
   * @constant
   */
  #MAX_LANE_COUNT: number = 256;

  /**
   * Lanes data and properties, this dict key means `lane_id`
   */
  #lanes: Map<number, AudioMixerLane>;

  /**
   * Over this milliseconds elapsed input will be ignored
   */
  #no_input_detect_msec: number;

  /**
   * Under this dBFS input will be ignored
   */
  #silent_threshold_dbfs: number;


  /**
   * Initialize with parameters setting
   *
   * @param {number} no_input_detect_msec No mixing what last input was over this milliseconds
   * @param {number} silent_threshold_dbfs No mixing what under this dbfs audio
   *
   * @throws {RangeError} If `no_input_detect_sec` is negative value
   * @throws {RangeError} If `silent_threshold_dbfs` is positive value
   */
  constructor(no_input_detect_msec: number = 300, silent_threshold_dbfs: number = -Infinity) {
    super();

    // Arguments range checking
    if(no_input_detect_msec < 0) {
      throw new RangeError(`no_input_detect_sec must be positive, but got ${no_input_detect_msec}`);
    }
    if(silent_threshold_dbfs > 0.0) {
      throw new RangeError(`silent_threshold_dbfs must be negative, but got ${silent_threshold_dbfs}`);
    }

    this.#lanes = new Map<number, AudioMixerLane>();
    this.#no_input_detect_msec = no_input_detect_msec;
    this.#silent_threshold_dbfs = silent_threshold_dbfs;
  }


  /**
   * Dispatch on lane created
   *
   * @event AudioMixer#lane-created
   * @type {MessageEvent}
   * @property {LaneInfo} data LaneInfo of created lane
   */

  /**
   * Create a new lane to add an input
   *
   * @returns Lane ID what assigned to created lane
   *
   * @throws {MaxLanesReachedError} If lane count already reached to 256
   */
  create_lane(): number {
    const lane_id = this.#lookup_available_lane_id();
    const new_lane = new AudioMixerLane(this.#create_silent_pcm(), "NEW", 0.0, Date.now(), -Infinity)
    this.#lanes.set(lane_id, new_lane);

    this.dispatchEvent(new MessageEvent<LaneInfo>("lane-created", {data: new LaneInfo(lane_id, "NEW", 0.0)}));

    return lane_id;
  }


  /**
   * Dispatch on lane name modified
   *
   * @event AudioMixer#lane-name-modified
   * @type {MessageEvent}
   * @property {LaneInfo} data LaneInfo of modified lane
   */

  /**
   * Input processing and return mixed audio
   *
   * @param lane_id Lane ID to control
   * @param pcm Audio PCM to input as specified lane
   *
   * @returns Mixed audio PCM (without own input audio)
   */
  lane_io(lane_id: number, pcm: Float32Array, lane_name: string): Float32Array {
    // Argument range checking
    if(pcm.length !== ONE_FRAME_SAMPLES) {
      throw new RangeError(`Unexpected frame sample count - expected ${ONE_FRAME_SAMPLES}, but got ${pcm.length}`);
    }

    const lane = this.#try_get_lane(lane_id);
    lane.pcm = pcm.map(e => e * 10 ** (lane.gain_db / 20));
    lane.last_input_ts = Date.now();
    lane.dbfs = dbfs_float(pcm);

    // update lane_name if modified
    if(lane_name !== lane.lane_name) {
      lane.lane_name = lane_name;

      this.dispatchEvent(new MessageEvent<LaneInfo>("lane-name-modified", {data: new LaneInfo(lane_id, lane_name, lane.gain_db)}));
    }

    // Audio mixing
    const pcm_mixed = this.#create_silent_pcm();
    const no_input_detect_msec = this.#no_input_detect_msec;
    const silent_threshold_dbfs = this.#silent_threshold_dbfs;
    const pcm_overlay = this.#pcm_overlay;
    this.#lanes.forEach((lane_mix, lane_id_mix) => {
      if(lane_id_mix === lane_id)
        return; // Ignore own audio
      if((Date.now() - lane_mix.last_input_ts) >= no_input_detect_msec)
        return; // Ignore no recent input lane
      if(lane_mix.dbfs <= silent_threshold_dbfs)
        return; // Ignore silent input lane
      pcm_overlay(pcm_mixed, lane_mix.pcm);
    });

    this.#pcm_clipping(pcm_mixed);
    return pcm_mixed;
  }


  /**
   * Get lanes status of lane name and gain
   *
   * @returns Current mixer status of lane name and gain
   */
  get_lanes_info() {
    const lanes_info: Array<LaneInfo> = [];
    this.#lanes.forEach((lane, lane_id) => {
      lanes_info.push(new LaneInfo(lane_id, lane.lane_name, lane.gain_db));
    });
    return lanes_info;
  }


  /**
   * Get lanes status of loudness
   *
   * @returns Current mixer status of loudness
   */
  get_lanes_dbfs() {
    const lanes_loudness: Array<LaneLoudness> = [];
    this.#lanes.forEach((lane, lane_id) => {
      lanes_loudness.push(new LaneLoudness(lane_id, lane.dbfs));
    });
    return lanes_loudness;
  }


  /**
   * Set a lane gain (volume) at dB
   *
   * @param lane_id Lane ID to set gain
   * @param gain_db Gain (in db) to set
   */
  set_lane_gain_db(lane_id: number, gain_db: number) {
    const target_lane = this.#try_get_lane(lane_id);

    target_lane.gain_db = gain_db;
  }


  /**
   * Dispatch on lane deleted
   *
   * @event AudioMixer#lane-deleted
   * @type {MessageEvent}
   * @property {number} data Lane ID of deleted
   */

  /**
   * Delete a lane
   *
   * @param lane_id Lane ID to delete
   */
  delete_lane(lane_id: number) {
    this.#try_get_lane(lane_id);
    this.#lanes.delete(lane_id);

    this.dispatchEvent(new MessageEvent<number>("lane-deleted", {data: lane_id}));
  }


  /**
   * Create a new Float32Array as a silent audio frame
   *
   * @returns Silent (all 0) audio frame
   */
  #create_silent_pcm(): Float32Array {
    return new Float32Array(ONE_FRAME_SAMPLES);
  }


  /**
   * 2 pcm overlaying (simple addition loop)
   *
   * Note: It causes mutation to argument, because of memory performance
   *
   * @param pcm_to_operate This array will be mutated as added value
   * @param pcm_to_overlay This values add to `pcm_to_operate`
   */
  #pcm_overlay(pcm_to_operate: Float32Array, pcm_to_overlay: Float32Array) {
    pcm_to_operate.forEach((_, i) => {
      pcm_to_operate[i] += pcm_to_overlay[i];
    });
  }


  /**
   * PCM clipping - under -1 adjust to -1, over +1 adjust to +1
   *
   * Note: It causes mutation to argument, because of memory performance
   *
   * @param pcm PCM to process (it will be mutated to clipped PCM)
   */
  #pcm_clipping(pcm: Float32Array) {
    pcm.forEach((_, i) => {
      if(pcm[i] < -1) pcm[i] = -1;
      if(pcm[i] >  1) pcm[i] =  1;
    });
  }


  /**
   * Return available smallest lane ID
   *
   * @returns Available smallest lane ID (0~255)
   *
   * @throws {MaxLanesReachedError} If lane count already reached to 256
   */
  #lookup_available_lane_id(): number {
    if(this.#lanes.size >= this.#MAX_LANE_COUNT) {
      throw new MaxLanesReachedError("Already reached to maximum lane count");
    }

    const allowed_ids = new Set<number>();
    for(let i = 0; i < this.#MAX_LANE_COUNT; i++) { allowed_ids.add(i); }

    const available_ids = allowed_ids.difference(this.#lanes);
    return Math.min(...available_ids);
  }


  /**
   * Get an `AudioMixerLane` object from `lane_id`
   *
   * @param lane_id Lane ID to get `AudioMixerLane`
   *
   * @throws {RangeError} If specified lane_id is not existing
   */
  #try_get_lane(lane_id: number): AudioMixerLane {
    if(lane_id < 0 || lane_id >= this.#MAX_LANE_COUNT) {
      throw new RangeError(`lane_id must be in 0~255, but got ${lane_id}`);
    }

    const lane = this.#lanes.get(lane_id);
    if(lane === undefined) {
      throw new NonExistingLaneIdError(`The lane id ${lane_id} is not existing`);
    }

    return lane;
  }
}
