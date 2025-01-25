/**
 * Part of `main.ts` for audio client websocket processing
 *
 * @author aKuad
 */

import { AudioMixer } from "./AudioMixer.ts";
import { is_audio_packet, packet_audio_encode, packet_audio_decode } from "../static/packet_conv/audio.js";


/**
 * Audio client websocket processing
 *
 * @param socket WebSocket for communicate client
 * @param audio_mixer AudioMixer of server core
 */
export function main_audio(socket: WebSocket, audio_mixer: AudioMixer) {
  socket.binaryType = "arraybuffer";
  let lane_id: number;

  socket.addEventListener("open", () => {
    lane_id = audio_mixer.create_lane();
  });

  socket.addEventListener("message", e => {
    const ws_receive = new Uint8Array(e.data);
    if(!is_audio_packet(ws_receive)) { return; }  // Do nothing for non audio packet
    const { audio_pcm, lane_name } = packet_audio_decode(ws_receive);
    const mixed_pcm = audio_mixer.lane_io(lane_id, audio_pcm, lane_name);
    const ws_return = packet_audio_encode(mixed_pcm, lane_name);
    socket.send(ws_return.buffer);
  });

  socket.addEventListener("close", () => audio_mixer.delete_lane(lane_id));
  socket.addEventListener("error", () => audio_mixer.delete_lane(lane_id));
}
