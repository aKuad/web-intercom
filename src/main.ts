/**
 * Inter-communication system on web
 *
 * Temporary implementation: only audio client with echo API
 *
 * @author aKuad
 */

import { serveDir } from "jsr:@std/http@1";


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

  } else if(url.pathname.startsWith("/api")) {
    // Undefined API
    return new Response("404 not found", { status: 404 });
  }


  /* Page endpoints */
  if(url.pathname.startsWith("/static")) {
    console.log("static call");
    return serveDir(request, { fsRoot: "./static", urlRoot: "static" });
  }
  return serveDir(request, { fsRoot: "./pages", urlRoot: "" });
});
