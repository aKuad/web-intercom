# Server sequence

## Audio communication

```mermaid
sequenceDiagram
  participant WSA as Audio client<br>(Websocket)
  participant S as Server main
  participant AM as Audio mixer

  Note over S: Connection start
  WSA->>S: Client connecting<br>Endpoint: /api/audio
  S->>AM: Lane create

  loop
    Note over S: Main communication
    WSA->>+S: Audio packet<br>[mic input]
    S->>+AM: Lane input
    AM-->>-S: Mixed audio
    S-->>-WSA: Audio packet<br>[mixed audio]
  end

  Note over S: Connection end
  WSA->>S: Connection close
  S->>AM: Lane delete
```

## Mixer control

```mermaid
sequenceDiagram
  participant WSM as Mixer client<br>(Websocket)
  participant S as Server main
  participant AM as Audio mixer

  Note over S: Connection start (success)
  WSM->>S: Client connecting<br>Endpoint: /api/mixer
  S->>+AM: Fetch lanes info
  AM-->>-S: Lanes info
  S->>WSM: Lanes info packet

  Note over S: Main communication
  par Lanes update
    Note over S: on client joined / renamed / left
    S->>WSM: Lanes info packet<br>(to all mixer clients)
  and Volume control
    Note over S: on volume controlled (at mixer client)
    WSM->>S: Volume modify packet
    S->>AM: Volume modification
    S->>WSM: Lanes info packet<br>(to all mixer clients)
  and Loudness monitor
    loop runs every 0.1 sec
      S->>+AM: Fetch each lanes dBFS
      AM-->>-S: dBFS
      S->>S: dBFS float to 0~255 integer
      S->>WSM: Loudness monitor packet
    end
  end

  Note over S: Connection end
  WSM->>S: Connection close
```
