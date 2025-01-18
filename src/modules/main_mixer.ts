/**
 * @file Part of `main.ts` for mixer client websocket processing
 *
 * @author aKuad
 */

import { AudioMixer } from "./AudioMixer.ts";
import { packet_lanes_info_encode } from "../static/packet_conv/lanes_info.js";
import { LaneInfo } from "../static/packet_conv/LaneInfo.js";
import { packet_lanes_loudness_encode } from "../static/packet_conv/lanes_loudness.js";
import { LaneLoudness } from "../static/packet_conv/LaneLoudness.js";
import { is_gain_modify_packet, packet_gain_modify_decode } from "../static/packet_conv/gain_modify.js";


/**
 * Mixer client websocket processing
 *
 * @param socket WebSocket for communicate client
 * @param audio_mixer AudioMixer of server core
 */
export function main_mixer(socket: WebSocket, audio_mixer: AudioMixer) {
  socket.binaryType = "arraybuffer";

  socket.addEventListener("open", () => {
    //// Temporary implementation: send constant LaneInfo data ////
    const packet = packet_lanes_info_encode([
      new LaneInfo(0, "MIX", -40),
      new LaneInfo(1, "AD1", 0),
      new LaneInfo(2, "AD2", 40)
    ]);
    socket.send(packet.buffer);
    ////
  });

  socket.addEventListener("message", e => {
    const data = new Uint8Array(e.data);
    if(is_gain_modify_packet(data)) {
      //// Temporary implementation: just only print ////
      console.log(packet_gain_modify_decode(data));
      ////
    }
  });

  const on_lane_updated = { handleEvent: (e: MessageEvent<LaneInfo[]>) => {
    //// Temporary implementation: just only print ////
    console.log(e.data);
    ////
  }};
  audio_mixer.addEventListener("lane-updated", on_lane_updated);
  // Update detection works only during mixer client connecting
  socket.addEventListener("close", () => audio_mixer.removeEventListener("lane-updated", on_lane_updated));
  socket.addEventListener("error", () => audio_mixer.removeEventListener("lane-updated", on_lane_updated));

  const loudness_monitor_interval = setInterval(() => {
    //// Temporary implementation: send random loudness ////
    const packet = packet_lanes_loudness_encode([
      new LaneLoudness(0, Math.random() * -80),
      new LaneLoudness(1, Math.random() * -80),
      new LaneLoudness(2, Math.random() * -80)
    ]);
    socket.send(packet.buffer);
    ////
  }, 100);

  socket.addEventListener("close", () => clearInterval(loudness_monitor_interval));
  socket.addEventListener("error", () => clearInterval(loudness_monitor_interval));
}
