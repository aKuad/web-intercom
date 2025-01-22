/**
 * @file Part of `main.ts` for mixer client websocket processing
 *
 * @author aKuad
 */

import { AudioMixer } from "./AudioMixer.ts";
import { packet_lanes_info_encode } from "../static/packet_conv/lanes_info.js";
import { LaneInfo } from "../static/packet_conv/LaneInfo.js";
import { is_gain_modify_packet, packet_gain_modify_decode } from "../static/packet_conv/gain_modify.js";
import { packet_lane_created_encode } from "../static/packet_conv/lane_created.js";
import { packet_lane_modified_encode } from "../static/packet_conv/lane_modified.js";
import { packet_lane_deleted_encode } from "../static/packet_conv/lane_deleted.js";
import { packet_lanes_loudness_encode } from "../static/packet_conv/lanes_loudness.js";


/**
 * Mixer client websocket processing
 *
 * @param socket WebSocket for communicate client
 * @param audio_mixer AudioMixer of server core
 */
export function main_mixer(socket: WebSocket, audio_mixer: AudioMixer) {
  socket.binaryType = "arraybuffer";

  // Lane initialization
  socket.addEventListener("open", () => {
    const packet = packet_lanes_info_encode(audio_mixer.get_lanes_info());
    socket.send(packet.buffer);
  });

  // Gain modify instruction
  socket.addEventListener("message", e => {
    const data = new Uint8Array(e.data);
    if(is_gain_modify_packet(data)) {
      const { lane_id, modified_gain_db } = packet_gain_modify_decode(data);
      audio_mixer.set_lane_gain_db(lane_id, modified_gain_db);
    }
  });

  // Lane created notice
  const on_lane_created = { handleEvent: (e: MessageEvent<LaneInfo>) => {
    const packet = packet_lane_created_encode(e.data);
    socket.send(packet.buffer);
  }};
  audio_mixer.addEventListener("lane-created", on_lane_created);
  socket.addEventListener("close", () => audio_mixer.removeEventListener("lane-created", on_lane_created)); // for only during mixer client connecting
  socket.addEventListener("error", () => audio_mixer.removeEventListener("lane-created", on_lane_created));

  // Lane name modified notice
  const on_lane_name_modified = { handleEvent: (e: MessageEvent<LaneInfo>) => {
    const packet = packet_lane_modified_encode(e.data);
    socket.send(packet.buffer);
  }};
  audio_mixer.addEventListener("lane-name-modified", on_lane_name_modified);
  socket.addEventListener("close", () => audio_mixer.removeEventListener("lane-name-modified", on_lane_name_modified)); // for only during mixer client connecting
  socket.addEventListener("error", () => audio_mixer.removeEventListener("lane-name-modified", on_lane_name_modified));

  // Lane deleted notice
  const on_lane_deleted = { handleEvent: (e: MessageEvent<number>) => {
    const packet = packet_lane_deleted_encode(e.data);
    socket.send(packet.buffer);
  }};
  audio_mixer.addEventListener("lane-deleted", on_lane_deleted);
  socket.addEventListener("close", () => audio_mixer.removeEventListener("lane-deleted", on_lane_deleted)); // for only during mixer client connecting
  socket.addEventListener("error", () => audio_mixer.removeEventListener("lane-deleted", on_lane_deleted));

  // Continuous loudness monitor
  const loudness_monitor_interval = setInterval(() => {
    const packet = packet_lanes_loudness_encode(audio_mixer.get_lanes_dbfs());
    socket.send(packet.buffer);
  }, 100);
  socket.addEventListener("close", () => clearInterval(loudness_monitor_interval));
  socket.addEventListener("error", () => clearInterval(loudness_monitor_interval));
}
