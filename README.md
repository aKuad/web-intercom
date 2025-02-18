# web-intercom

[![Version](https://img.shields.io/github/v/release/aKuad/web-intercom?label=version)](https://github.com/aKuad/py-web-intercom/releases) [![License](https://img.shields.io/github/license/aKuad/web-intercom)](https://github.com/aKuad/py-web-intercom/blob/main/LICENSE)

Inter-communication system on browser via LAN. Powered by Deno.

![Top image](./assets/top-image.webp)

## Features

- Multi users talking
  - Required only a browser, additional applications isn't necessary
  - ... means this is cross-platform
- Each user's input volume controlling
  - Also works on browsers
- Easy to setup the server
  - Required only Deno

## Server deployment

As requirements, install [Deno](https://deno.com/) at first.

### For localhost check

Just only run:

```sh
deno run --allow-net --allow-read main.ts
```

### For outside connection

> [!NOTE]
>
> For using mic input, secure context is required. It means not working on HTTP, need to be HTTP**S**.

Generate key and certificate for HTTP**S** connection.

> [!CAUTION]
>
> This step generates self signed certificate. Use only in LAN, then **do not open to the Internet**.

```sh
cd src
openssl req -newkey rsa:4096 -x509 -nodes -subj '/CN=common_name_here' -keyout key.pem -out cert.pem
```

> [!NOTE]
>
> `src/main.ts` loads private key from `src/key.pem` and certificate from `src/cert.pem`.

Then run with `--tls` option:

```sh
deno run --allow-net --allow-read main.ts --tls
```

## Client usage

### Audio client

Access to `http(s)://server.address:8000/`

Type lane name, then click 'connect'.

![Audio client UI - Lane name setting](./assets/ui-image-audio-client.webp)

### Mixer client

Access to `http(s)://server.address:8000/mixer.html`

Type lane name, then click 'connect'.

![Mixer client UI - Lane name setting](./assets/ui-image-mixer-client-1.webp)

Then view all lanes fader and meter. Move fader to control gain of each lane.

![Mixer client UI - Volume control](./assets/ui-image-mixer-client-2.webp)

## License

[CC0-1.0](https://github.com/aKuad/py-web-intercom/blob/main/LICENSE)
