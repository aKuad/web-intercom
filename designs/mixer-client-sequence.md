# Mixer client sequence

```mermaid
sequenceDiagram
  participant MU as Mixer UI
  participant CM as Client main
  participant WSS as Server<br>(Websocket)

  CM->>WSS: Connect<br>Endpoint: /api/mixer
  CM->>MU: Init UI

  par Mixer client connected
    Note over CM: on mixer connection open
    WSS->>CM: Lanes info packet
    CM->>MU: UI updating (lanes)
  and Lane update
    Note over CM: on audio client joined / renamed / left
    WSS->>CM: Lane created / modified / deleted packet
    CM->>MU: UI updating (a lane)
  and Volume control
    Note over CM: on volume controlled
    MU->>CM: Event dispatch
    CM->>WSS: Gain modify packet
  and Loudness monitor
    loop runs every 0.1 sec
      WSS->>CM: Loudness monitor packet
      CM->>MU: UI updating (meter)
    end
  end
```

> [!NOTE]
>
> Audio client also runs in parallel. It for mixer monitor.

...

> [!NOTE]
>
> It suppose implementation of JavaScript.
>
> At Python (with `websockets` module), it takes a little different sequence. But almost of all is same.
