# py-web-intercom

[![Version](https://img.shields.io/github/v/release/aKuad/py-web-intercom?label=version)](https://github.com/aKuad/py-web-intercom/releases) [![License](https://img.shields.io/github/license/aKuad/py-web-intercom)](https://github.com/aKuad/py-web-intercom/blob/main/LICENSE)

Inter-communication system on browser via LAN. Powered by python.

<!-- Screen shots here -->

## Features

- Multi users talking
  - Required only a browser, additional applications isn't necessary
  - ... means this is cross-platform
- Each user's input volume controlling
  - Also works on browsers
- Easy to setup the server
  - Required only python3 with pip

## Client usage

### Minimum client (.py)

First, install dependencies.

> [!TIP]
>
> If you need, work on virtual environment.

```sh
pip install -r assets/requirements-min_client.txt
# or
pip install websockets numpy sounddevice
```

Then, run `min_client.py`.

```sh
cd src  # Working directory must be `src`
python3 min_client.py
```

## Server deployment

*Work in progress*

## Using libraries

websockets - Copyright (c) Aymeric Augustin and contributors

numpy - Copyright (c) NumPy Developers

sounddevice - Copyright (c) 2015-2023 Matthias Geier

## License

[CC0-1.0](https://github.com/aKuad/py-web-intercom/blob/main/LICENSE)
