# Server sequence

## Audio communication

```mermaid
sequenceDiagram
  participant WSA as Audio client<br>(Websocket)
  participant S as Server main
  participant AM as Audio mixer

  WSA->>S: Client connecting
  S->>AM: Lane create

  loop
    WSA->>+S: Audio packet<br>[mic input]
    S->>+AM: Lane input
    AM-->>-S: Mixed audio
    S-->>-WSA: Audio packet<br>[mixed audio]
  end
```

## Mixer control

```mermaid
sequenceDiagram
  participant WSM as Mixer client<br>(Websocket)
  participant S as Server main
  participant AM as Audio mixer

  WSM->>S: Client connecting
  S->>+AM: Fetch lanes info
  AM-->>-S: Lanes info
  S->>WSM: Lanes info packet

  par Lanes update
    Note over S: on client joined / renamed / left
    S->>WSM: Lanes info packet [updating]<br>(to all mixer clients)
  and Volume control
    Note over S: on user controlled
    WSM->>S: Volume modify packet
    S->>AM: Volume modification
    S->>WSM: Lanes info packet [updating]<br>(to all mixer clients)
  and Loudness monitor
    loop runs every 0.1 sec
      S->>+AM: Fetch each lanes dBFS
      AM-->>-S: dBFS
      S->>S: dBFS float to 0~255 integer
      S->>WSM: Loudness monitor packet
    end
  end
```
