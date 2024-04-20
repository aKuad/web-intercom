# coding: UTF-8
"""Tests for ``packet_conv/audio.py``

Test cases:
  * Can convert audio data in ``AudioSegment`` with[out] custom bytes to bytes, and reverse convert

Test steps:
  1. Set current here
  2. Run this

Author:
  aKuad

"""

# For import top layer module
import sys
from pathlib import Path
sys.path.append(Path(__file__).absolute().parent.parent.parent.__str__())


import unittest

import numpy as np
from pydub import AudioSegment

from modules.packet_conv import AUDIO_PARAM, audio_aseg


class Test_packet_conv_audio_aseg(unittest.TestCase):
  def test_audio_packet_enc_dec_audioseg_ext(self):
    aud_org = part_create_testdata_audioseg()
    ext_org = bytes([1, 2, 3, 4])

    packet = audio_aseg.encode(aud_org, ext_org)
    aud_prc, ext_prc = audio_aseg.decode(packet)

    self.assertEqual(aud_org, aud_prc)
    self.assertEqual(ext_org, ext_prc)


  def test_audio_packet_enc_dec_audioseg_noext(self):
    aud_org = part_create_testdata_audioseg()
    ext_org = bytes()

    packet = audio_aseg.encode(aud_org, ext_org)
    aud_prc, ext_prc = audio_aseg.decode(packet)

    self.assertEqual(aud_org, aud_prc)
    self.assertEqual(ext_org, ext_prc)


def part_create_testdata_ndarray() -> np.ndarray:
  x = np.arange(AUDIO_PARAM.SAMPLE_RATE)
  y = np.sin(np.deg2rad(x)) * (2**(AUDIO_PARAM.ONE_SAMPLE_BYTES * 8 - 1) - 100)
  #                           ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  #                           Increase amplitude
  # 2**(BYTES * 8 - 1) : data type's max value, -1 for sign bit
  # - 100              : make margin
  return np.int16(y).reshape(-1, 1) # reshape for monaural audio data


def part_create_testdata_audioseg() -> AudioSegment:
  raw = part_create_testdata_ndarray().tobytes()
  return AudioSegment(raw, sample_width=AUDIO_PARAM.ONE_SAMPLE_BYTES, frame_rate=AUDIO_PARAM.SAMPLE_RATE, channels=1)


if __name__ == "__main__":
  unittest.main(verbosity=2)