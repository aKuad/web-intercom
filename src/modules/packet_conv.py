# coding: UTF-8
"""Conversion functions between raw packet and external bytes & raw audio bytes

Functions for convert ``pydub.AudioSegment`` or ``numpy.ndarray`` object to ``bytes``, also reverse can.
By conversion, be able to transmit through HTTP, websocket and so on.

Note:
  Audio format (e.g. sample rate, channels) must be specified in ``AUDIO_PARAM.py``.
  It supports only monaural audio, not for multi channels.

Author: aKuad

"""

from pydub import AudioSegment
import numpy as np

import AUDIO_PARAM


def packet_enc_ndarray(audio_data: np.ndarray, ext_data: bytes = bytes()) -> bytes:
  """Create audio data packet from ``numpy.ndarray``

  Args:
    audio_data(np.ndarray): Audio data in ``np.ndarray``
    ext_data(bytes): User's custom external data

  Note:
    ``ext_data`` can contain 0~255 bytes

  Return:
    bytes: Audio data packet

  """
  return bytes([len(ext_data)]) + ext_data + audio_data.tobytes()


def packet_dec_ndarray(packet: bytes) -> tuple[np.ndarray, bytes]:
  """Unpack audio data packet to ``numpy.ndarray`` and external data as bytes

  Args:
    packet(bytes): Audio data packet

  Return:
    tuple[numpy.ndarray, bytes]: Audio data in ``numpy.ndarray`` and external data

  """
  ext_data_len = packet[0]
  ext_data = packet[1 : 1 + ext_data_len]
  audio_data_raw = packet[1 + ext_data_len :]
  audio_data: np.ndarray = np.frombuffer(audio_data_raw, dtype=AUDIO_PARAM.DTYPE)
  audio_data             = audio_data.reshape(-1, 1)  # 1 channel audio data
  return (audio_data, ext_data)


def packet_enc_audioseg(audio_data: AudioSegment, ext_data: bytes = bytes()) -> bytes:
  """Create audio data packet from ``pydub.AudioSegment``

  Args:
    audio_data(pydub.AudioSegment): Audio data in ``pydub.AudioSegment``
    ext_data(bytes): User's custom external data

  Note:
    ``ext_data`` can contain 0~255 bytes

  Return:
    bytes: Audio data packet

  """
  return bytes([len(ext_data)]) + ext_data + audio_data.raw_data


def packet_dec_audioseg(packet: bytes) -> tuple[AudioSegment, bytes]:
  """Unpack audio data packet to ``pydub.AudioSegment`` and external data as bytes

  Args:
    packet(bytes): Audio data packet

  Return:
    tuple[pydub.AudioSegment, bytes]: Audio data in ``pydub.AudioSegment`` and external data

  """
  ext_data_len = packet[0]
  ext_data = packet[1 : 1 + ext_data_len]
  audio_data_raw = packet[1 + ext_data_len :]
  audio_data = AudioSegment(audio_data_raw, sample_width=AUDIO_PARAM.ONE_SAMPLE_BYTES, frame_rate=AUDIO_PARAM.SAMPLE_RATE, channels=1)
  return (audio_data, ext_data)
