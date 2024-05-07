# coding: UTF-8
"""Tests for ``packet_conv/aseg.py``

Test cases:
  * Can encode/decode audio packet from/to ``AudioSegment`` with[out] custom bytes to bytes
  * Raise TypeError if invalid argument is passed
  * Raise ValueError if invalid argument is passed

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
from random import randbytes

from pydub import AudioSegment

from modules.packet_conv import AUDIO_PARAM, audio_aseg


class Test_packet_conv_audio_aseg(unittest.TestCase):
  def test_true_enc_dec_ext(self):
    audio_pcm_org = part_create_random_audioseg()
    lane_name_org = "ABC"
    ext_bytes_org = bytes([1, 2, 3, 4])

    packet = audio_aseg.encode(audio_pcm_org, lane_name_org, ext_bytes_org)
    audio_pcm_prc, lane_name_prc, ext_bytes_prc = audio_aseg.decode(packet)

    self.assertTrue(audio_pcm_org == audio_pcm_prc)
    self.assertEqual(lane_name_org, lane_name_prc)
    self.assertEqual(ext_bytes_org, ext_bytes_prc)


  def test_true_enc_dec_noext(self):
      audio_pcm_org = part_create_random_audioseg()
      lane_name_org = "ABC"
      ext_bytes_org = bytes()

      raw_packet = audio_aseg.encode(audio_pcm_org, lane_name_org, ext_bytes_org)
      audio_pcm_prc, lane_name_prc, ext_bytes_prc = audio_aseg.decode(raw_packet)

      self.assertTrue(audio_pcm_org == audio_pcm_prc)
      self.assertEqual(lane_name_org, lane_name_prc)
      self.assertEqual(ext_bytes_org, ext_bytes_prc)


  def test_err_enc_invalid_type(self):
    audio_pcm = part_create_random_audioseg()
    lane_name = "ABC"
    ext_bytes = bytes([1,2,3])

    self.assertRaises(TypeError, audio_aseg.encode, ""       , lane_name, ext_bytes) # str "" as non AudioSegment
    self.assertRaises(TypeError, audio_aseg.encode, audio_pcm, 1        , ext_bytes) # int 1 as non str
    self.assertRaises(TypeError, audio_aseg.encode, audio_pcm, lane_name, "")        # str "" as non bytes


  def test_err_enc_invalid_value(self):
    audio_pcm = part_create_random_audioseg()
    lane_name = "ABC"
    ext_bytes = bytes([1,2,3])

    lane_name_non_ascii = "🗒"
    lane_name_over_len = "ABCD"
    ext_bytes_over_len = bytes(256)

    self.assertRaises(ValueError, audio_aseg.encode, audio_pcm, lane_name_non_ascii, ext_bytes)
    self.assertRaises(ValueError, audio_aseg.encode, audio_pcm, lane_name, ext_bytes_over_len)
    self.assertRaises(ValueError, audio_aseg.encode, audio_pcm, lane_name_over_len, ext_bytes)


  def test_err_dec_invalid_type(self):
    self.assertRaises(TypeError, audio_aseg.decode, "")  # str "" as non bytes


  def test_err_dec_invalid_value(self):
    raw_packet_invalid_id = b"A" + b"ABC" + bytes([0]) + part_create_random_audioseg().raw_data
    #                       ~~~~ as non 0x10 byte
    raw_packet_invalid_len = audio_aseg.AUDIO_PACKET_TYPE_ID.to_bytes(1, "little") + b"ABC"
    # ext_bytes data missing packet

    self.assertRaises(ValueError, audio_aseg.decode, raw_packet_invalid_id)
    self.assertRaises(ValueError, audio_aseg.decode, raw_packet_invalid_len)


def part_create_random_audioseg() -> AudioSegment:
  raw = randbytes(int(AUDIO_PARAM.SAMPLE_RATE * AUDIO_PARAM.ONE_SAMPLE_BYTES * AUDIO_PARAM.FRAME_DURATION_SEC)) # Random bytes as random audio data
  return AudioSegment(raw,
                      sample_width=AUDIO_PARAM.ONE_SAMPLE_BYTES,
                      frame_rate=AUDIO_PARAM.SAMPLE_RATE,
                      channels=AUDIO_PARAM.CHANNELS)


if __name__ == "__main__":
  unittest.main(verbosity=2)
