/**
 * @file Simple HTTP server for server connection required JavaScript modules tests
 *
 * Note: About test details, see each testing HTML codes.
 *
 * @author aKuad
 */

import { serveDir } from "jsr:@std/http@1";


Deno.serve(request => {
  const url = new URL(request.url);

  /* API endpoints */
  if(url.pathname === "/api/echo") {
    return new Response(request.body);
  }

  if(url.pathname === "/api/ws-echo") {
    if(request.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(request);  // Establish websocket echo API connection
      socket.addEventListener("message", e => socket.send(e.data)); //
      return response;                                              //
    } else {
      return new Response("This API is for websocket, protocol upgrade required", { status: 426 });
    }
  }


  /* Page endpoints */
  if(url.pathname.startsWith("/static")) {
    return serveDir(request, { fsRoot: "../../static", urlRoot: "static"});
  }

  if(url.pathname.startsWith("/test-util")) {
    return serveDir(request, { fsRoot: "../js_denotest/util", urlRoot: "test-util"});
  }

  return serveDir(request, { fsRoot: "./", urlRoot: ""});
});
