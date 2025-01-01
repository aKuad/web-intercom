/**
 * Main of `index.html` - audio client
 *
 * @author aKuad
 */

import { AudioClientModule } from "./audio_connect/AudioClientModule.js";


globalThis.addEventListener("load", () => {
  /* Input checking */
  document.getElementById("control-container").addEventListener("input", e => {
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


  /* Start connection */
  document.getElementById("connect-start").addEventListener("click", () => {
    const lane_name = document.getElementById("lane-name-input").value;

    // View update for communicating
    document.getElementById("lane-name-guide").innerText = "Lane name:";
    document.getElementById("lane-name-input").remove();
    document.getElementById("connect-start").remove();
    document.getElementById("lane-name-view").innerText = lane_name;

    // Connect & connection closed event
    const audio_client_module = new AudioClientModule("/api/audio", lane_name, -40.0);
    audio_client_module.websocket_obj.addEventListener("close", () => {
      document.getElementById("error-view").innerText = "Connection error occurred";
    });
    audio_client_module.websocket_obj.addEventListener("error", () => {
      document.getElementById("error-view").innerText = "Connection closed by server";
    });
  });
});
