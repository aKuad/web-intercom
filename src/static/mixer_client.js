/**
 * Main of `mixer.html` - mixer client
 *
 * @author aKuad
 */

import { MixerUI } from "./MixerUI/MixerUI.js";
import { AudioClientModule } from "./audio_connect/AudioClientModule.js";
import { packet_gain_modify_encode } from "./packet_conv/gain_modify.js";
import { is_lanes_info_packet, packet_lanes_info_decode } from "./packet_conv/lanes_info.js";
import { is_lanes_loudness_packet, packet_lanes_loudness_decode } from "./packet_conv/lanes_loudness.js";


globalThis.addEventListener("load", () => {
  document.getElementById("connect-start").addEventListener("click", async e => {
    // Prevent double click
    e.target.disabled = true;

    // Try to get mixer control connection
    const mixer_ws = new WebSocket("/api/mixer");
    const is_mixer_connect_success = await new Promise(resolve => {
      mixer_ws.addEventListener("open", () => resolve(true));
      mixer_ws.addEventListener("error", () => resolve(false));
    });

    if(is_mixer_connect_success) {
      e.target.remove();
      document.getElementById("error-view").innerText = ""; // Clear error message
    } else {
      e.target.disabled = false;
      document.getElementById("error-view").innerText = "Mixer client is in use";
      return;
    }

    // UI control for gain modify
    const mixer_ui = new MixerUI(document.getElementById("mixer-container"));
    mixer_ui.addEventListener("fader-moved", e => {
      const lane_id = Number(e.origin);
      const modified_gain_db = Number(e.data);
      const gain_modify_packet = packet_gain_modify_encode(lane_id, modified_gain_db);
      mixer_ws.send(gain_modify_packet);
    });

    // UI update for lane count modify & loudness monitor
    mixer_ws.binaryType = "arraybuffer";
    mixer_ws.addEventListener("message", e => {
      const ws_receive = new Uint8Array(e.data);
      if(is_lanes_info_packet(ws_receive)) {
        const lanes_info = packet_lanes_info_decode(ws_receive);
        //// Temporary implementation: only lanes addition ////
        lanes_info.forEach(lane_info => {
          mixer_ui.create_lane(lane_info.lane_name, lane_info.lane_id)
          mixer_ui.set_fader_value(lane_info.lane_id, lane_info.current_gain_db);
        });
        ////
      } else if(is_lanes_loudness_packet(ws_receive)) {
        const lanes_loudness = packet_lanes_loudness_decode(ws_receive);
        lanes_loudness.forEach(lane_loudness => {
          mixer_ui.set_meter_value(lane_loudness.lane_id, (lane_loudness.current_dbfs + 40) * 2);
          // `lane_loudness.current_dbfs` Range conversion:
          //        [-80, 0]
          // +40 -> [-40, 40]
          // *2  -> [-80, 80]
        });
      }
    })

    // On closed status indication
    mixer_ws.addEventListener("close", () => {
      document.getElementById("error-view").innerText = "Mixer connection closed by server";
    });
    mixer_ws.addEventListener("error", () => {
      document.getElementById("error-view").innerText = "Mixer connection error occurred";
    });

    // Audio client for mixer user
    const audio_client_module = new AudioClientModule("/api/audio", "MIX", -40.0);
    audio_client_module.websocket_obj.addEventListener("close", () => {
      document.getElementById("error-view").innerText = "Audio connection closed by server";
    });
    audio_client_module.websocket_obj.addEventListener("error", () => {
      document.getElementById("error-view").innerText = "Audio connection error occurred";
    });
  });
});
