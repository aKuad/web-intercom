# coding: UTF-8
"""Tests for ``packet_conv/audio_ndarray.py``

Test cases:
  * Can convert audio data in ``ndarray`` with[out] custom bytes to bytes, and reverse convert

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

from modules.packet_conv import AUDIO_PARAM, audio_ndarray


class Test_packet_conv_audio_ndarray(unittest.TestCase):
  def test_audio_packet_enc_dec_ndarray_ext(self):
    aud_org = part_create_random_ndarray()
    ext_org = bytes([1, 2, 3, 4])

    packet = audio_ndarray.encode(aud_org, ext_org)
    aud_prc, ext_prc = audio_ndarray.decode(packet)

    self.assertTrue((aud_org == aud_prc).all())
    self.assertEqual(ext_org, ext_prc)


  def test_audio_packet_enc_dec_ndarray_noext(self):
    aud_org = part_create_random_ndarray()
    ext_org = bytes()

    packet = audio_ndarray.encode(aud_org, ext_org)
    aud_prc, ext_prc = audio_ndarray.decode(packet)

    self.assertTrue((aud_org == aud_prc).all())
    self.assertEqual(ext_org, ext_prc)


def part_create_random_ndarray() -> np.ndarray:
  # Random bytes as random audio data
  return np.random.randint(-(2**15), (2**15)-1,
                           size=(AUDIO_PARAM.SAMPLE_RATE, 1),
                           dtype=AUDIO_PARAM.DTYPE)


if __name__ == "__main__":
  unittest.main(verbosity=2)
