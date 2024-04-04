# Server sequence

## Audio communication

```mermaid
sequenceDiagram
  participant WSA as Audio client<br>(Websocket)
  participant S as Server main
  participant AM as Audio mixer

  WSA->>S: Client connected
  S->>AM: Lane create

  loop
    WSA->>+S: mic_in = receive()
    S->>+AM: lane_input(mic_in)
    AM-->>-S: mixed_audio
    S-->>-WSA: send(mixed_audio)
  end
```

## Mixer control

```mermaid
sequenceDiagram
  participant WSM as Mixer client<br>(Websocket)
  participant S as Server main
  participant AM as Audio mixer

  WSM->>S: Client connected
  S->>+AM: Fetch lanes info
  AM-->>-S: Lanes info
  S->>WSM: Lanes info

  par Lanes update
    Note over S: on client joined / renamed / left
    S->>WSM: Lanes info<br>(to all mixer clients)
  and Volume control
    Note over S: on user controlled
    WSM->>S: Modified volume value
    S->>AM: Volume modification
    S-->>WSM: Modified volume value<br>(to all mixer clients)
  and Loudness monitor
    loop runs every 0.1 sec
      S->>+AM: Fetch each lanes dBFS
      AM-->>-S: dBFS
      S->>S: dBFS float to 0~255 integer
      S->>WSM: Current loudness in integer
    end
  end
```
