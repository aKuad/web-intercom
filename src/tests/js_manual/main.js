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

  if(url.pathname.startsWith("/static")) {
    return serveDir(request, { fsRoot: "../../static", urlRoot: "static"});
  }

  if(url.pathname.startsWith("/test-util")) {
    return serveDir(request, { fsRoot: "../js_denotest/util", urlRoot: "test-util"});
  }

  return serveDir(request, { fsRoot: "./", urlRoot: ""});
});
