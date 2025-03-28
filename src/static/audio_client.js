/**
 * Main of `index.html` - audio client
 *
 * @author aKuad
 */

import { keep_wake_lock } from "./util/keep_wake_lock.js";
import { AudioClientModule } from "./audio_connect/AudioClientModule.js";


globalThis.addEventListener("load", () => {
  /* Restore last lane name */
  // If storage 'lane-name-last' is null, set empty string
  document.getElementById("lane-name-input").value = localStorage.getItem("lane-name-last") || "";


  /* Input checking */
  document.getElementById("control-container").addEventListener("input", e => {
    const lane_name_input = e.target.value;

    if(!(/^[\x20-\x7F]*$/.test(lane_name_input))) {
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


  /* Start connection */
  document.getElementById("connect-start").addEventListener("click", () => {
    // Lane name control
    const lane_name_input = document.getElementById("lane-name-input").value;
    const lane_name = lane_name_input || document.getElementById("lane-name-input").placeholder;  // Try to set input value, if empty, set placeholder value
    localStorage.setItem("lane-name-last", lane_name_input);  // Store input lane name

    // Prevent system lock or display sleep
    keep_wake_lock();

    // View update for communicating
    document.getElementById("lane-name-guide").innerText = "Lane name:";
    document.getElementById("lane-name-input").remove();
    document.getElementById("connect-start").remove();
    document.getElementById("mixer-client-link").remove();
    document.getElementById("lane-name-view").innerText = lane_name;

    // Connect & connection closed event
    const audio_client_module = new AudioClientModule("/api/audio", lane_name, -40.0);
    audio_client_module.websocket_obj.addEventListener("close", () => {
      document.getElementById("error-view").innerText = "Connection closed by server";
    });
    audio_client_module.websocket_obj.addEventListener("error", () => {
      document.getElementById("error-view").innerText = "Connection error occurred";
    });
  });
});
