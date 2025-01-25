/**
 * Main of `mixer.html` - mixer client
 *
 * @author aKuad
 */

import { MixerUI } from "./MixerUI/MixerUI.js";
import { keep_wake_lock } from "./util/keep_wake_lock.js";
import { AudioClientModule } from "./audio_connect/AudioClientModule.js";
import { packet_gain_modify_encode } from "./packet_conv/gain_modify.js";
import { is_lanes_info_packet, packet_lanes_info_decode } from "./packet_conv/lanes_info.js";
import { is_lane_created_packet, packet_lane_created_decode } from "./packet_conv/lane_created.js";
import { is_lane_modified_packet, packet_lane_modified_decode } from "./packet_conv/lane_modified.js";
import { is_lane_deleted_packet, packet_lane_deleted_decode } from "./packet_conv/lane_deleted.js";
import { is_lanes_loudness_packet, packet_lanes_loudness_decode } from "./packet_conv/lanes_loudness.js";


globalThis.addEventListener("load", () => {
  /* Lane name input checking */
  document.getElementById("lane-name-input").addEventListener("input", e => {
    const input_name = e.target.value;

    if(input_name === "") {
      // If empty input
      set_input_error("Lane name can't be empty");
    } else if(!(/^[\x20-\x7F]*$/.test(input_name))) {
      // If non ascii input
      set_input_error("Non ascii disallowed for lane name");
    } else {
      // Correct input
      set_input_error("");
    }
  });


  function set_input_error(message) {
    if(message === "") {
      document.getElementById("lane-name-input").classList.remove("invalid-input");
      document.getElementById("connect-start").disabled = false;
      document.getElementById("error-view").innerText = "";
    } else {
      document.getElementById("lane-name-input").classList.add("invalid-input");
      document.getElementById("connect-start").disabled = true;
      document.getElementById("error-view").innerText = message;
    }
  }


  /* Connection main behavior */
  document.getElementById("connect-start").addEventListener("click", async e => {
    // Prevent double click
    e.target.disabled = true;

    // Try to get mixer control connection
    const mixer_ws = new WebSocket("/api/mixer");
    mixer_ws.binaryType = "arraybuffer";
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

    // Prevent system lock or display sleep
    keep_wake_lock();

    // UI control for gain modify
    const lane_name = document.getElementById("lane-name-input").value; // Get lane name before input removed
    document.getElementById("mixer-container").replaceChildren(); // Remove all child elements (are lane name input)
    const mixer_ui = new MixerUI(document.getElementById("mixer-container"));
    mixer_ui.addEventListener("fader-moved", e => {
      const lane_id = Number(e.origin);
      const modified_gain_db = Number(e.data);
      const gain_modify_packet = packet_gain_modify_encode(lane_id, modified_gain_db);
      mixer_ws.send(gain_modify_packet);
    });

    // UI update for lane init & lane modify & loudness monitor
    mixer_ws.addEventListener("message", e => {
      const ws_receive = new Uint8Array(e.data);
      if(is_lanes_info_packet(ws_receive)) {
        const lanes_info = packet_lanes_info_decode(ws_receive);
        lanes_info.forEach(lane_info => {
          mixer_ui.create_lane(lane_info.lane_name, lane_info.lane_id)
          mixer_ui.set_fader_value(lane_info.lane_id, lane_info.current_gain_db);
        });

      } else if(is_lane_created_packet(ws_receive)) {
        const { lane_id, lane_name, current_gain_db } = packet_lane_created_decode(ws_receive);
        mixer_ui.create_lane(lane_name, lane_id);
        mixer_ui.set_fader_value(lane_id, current_gain_db);

      } else if(is_lane_modified_packet(ws_receive)) {
        const { lane_id, lane_name, current_gain_db } = packet_lane_modified_decode(ws_receive)
        mixer_ui.set_fader_value(lane_id, current_gain_db);
        mixer_ui.set_lane_name(lane_id, lane_name);

      } else if(is_lane_deleted_packet(ws_receive)) {
        const lane_id = packet_lane_deleted_decode(ws_receive);
        mixer_ui.delete_lane(lane_id);

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
    const audio_client_module = new AudioClientModule("/api/audio", lane_name, -40.0);
    audio_client_module.websocket_obj.addEventListener("close", () => {
      document.getElementById("error-view").innerText = "Audio connection closed by server";
    });
    audio_client_module.websocket_obj.addEventListener("error", () => {
      document.getElementById("error-view").innerText = "Audio connection error occurred";
    });
  });
});
