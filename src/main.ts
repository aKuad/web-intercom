/**
 * Inter-communication system on web
 *
 * Temporary implementation: only audio client with echo API
 *
 * @author aKuad
 */

import { serveDir } from "jsr:@std/http@1";

import { main_mixer } from "./modules/main_mixer.ts";
import { AudioMixer } from "./modules/AudioMixer.ts";


const audio_mixer = new AudioMixer();
let is_mixer_client_in_use = false;


Deno.serve(request => {
  const url = new URL(request.url);

  /* API endpoints */
  if(url.pathname === "/api/audio") {
    // Audio client websocket API
    if(request.headers.get("upgrade") !== "websocket") {
      return new Response("This API is for websocket, protocol upgrade required", { status: 426 });
    }

    const { socket, response } = Deno.upgradeWebSocket(request);
    socket.binaryType = "arraybuffer";

    socket.addEventListener("message", e => {
      const ws_receive: ArrayBuffer = e.data;
      socket.send(ws_receive);  // Echo API as temporary implementation
    });
    return response;


  } else if(url.pathname === "/api/mixer") {
    // Mixer client websocket API
    if(request.headers.get("upgrade") !== "websocket") {
      return new Response("This API is for websocket, protocol upgrade required", { status: 426 });
    }

    if(is_mixer_client_in_use) {
      return new Response("Mixer client is in use", { status: 403 });
    }

    is_mixer_client_in_use = true;
    const { socket, response } = Deno.upgradeWebSocket(request);
    main_mixer(socket, audio_mixer);
    socket.addEventListener("close", () => is_mixer_client_in_use = false);
    socket.addEventListener("error", () => is_mixer_client_in_use = false);
    return response;


  } else if(url.pathname.startsWith("/api")) {
    // Undefined API
    return new Response("404 not found", { status: 404 });
  }


  /* Page endpoints */
  if(url.pathname.startsWith("/static")) {
    return serveDir(request, { fsRoot: "./static", urlRoot: "static" });
  }
  return serveDir(request, { fsRoot: "./pages", urlRoot: "" });
});
