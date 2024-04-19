# coding: UTF-8
"""Conversion functions between raw packet and external bytes & raw audio bytes

Function for convert ``numpy.ndarray`` object to ``bytes``, also reverse can.
By conversion, be able to transmit through HTTP, websocket and so on.

Note:
  Audio format (e.g. sample rate, channels) must be specified in ``AUDIO_PARAM.py``.
  It supports only monaural audio, not for multi channels.

Author:
  aKuad

"""

import numpy as np

import AUDIO_PARAM


def encode(audio_data: np.ndarray, ext_data: bytes = bytes()) -> bytes:
  """Create audio packet from ``numpy.ndarray`` and external bytes

  Args:
    audio_data(np.ndarray): Audio data in ``np.ndarray``
    ext_data(bytes): User's custom external data

  Note:
    ``ext_data`` can contain 0~255 bytes

  Return:
    bytes: Audio packet

  """
  return bytes([len(ext_data)]) + ext_data + audio_data.tobytes()


def decode(packet: bytes) -> tuple[np.ndarray, bytes]:
  """Unpack audio packet to ``numpy.ndarray`` and external data as bytes

  Args:
    packet(bytes): Audio data packet

  Return:
    tuple[numpy.ndarray, bytes]: Audio data in ``numpy.ndarray`` and external bytes

  """
  ext_data_len = packet[0]
  ext_data = packet[1 : 1 + ext_data_len]
  audio_data_raw = packet[1 + ext_data_len :]
  audio_data: np.ndarray = np.frombuffer(audio_data_raw, dtype=AUDIO_PARAM.DTYPE)
  audio_data             = audio_data.reshape(-1, 1)  # 1 channel audio data
  return (audio_data, ext_data)
