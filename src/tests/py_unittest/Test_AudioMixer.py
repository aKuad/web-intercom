# coding: UTF-8
"""Tests for ``AudioMixer.py``

Test cases:
  * Raise ``TypeError`` if invalid argument type is passed
  * Raise ``ValueError`` if invalid argument value is passed
  * Raise ``MaxLaneReachedError`` if over 256 lanes created
  * Raise ``KeyError`` if non existing lane_id is passed
  * Raise ``ValueError`` if invalid duration, sample_width, sample_rate or channels ``AudioSegment`` passed to ``lane_id``
  * Can be gained (positive/negative) input audio
  * Can delete a lane

Test steps:
  * Run this script by unittest - ``python3 -m unittest discover "Test_*.py"``

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

from modules.AudioMixer import AudioMixer, MaxLaneReachedError
from modules.packet_conv import AUDIO_PARAM


class Test_AudioMixer(unittest.TestCase):
  def test_err_constructor_arg(self):
    self.assertRaises(TypeError, AudioMixer, "str", -20.0)  # "str" as non float
    self.assertRaises(TypeError, AudioMixer,   0.3, "str")  # "str" as non float

    self.assertRaises(ValueError, AudioMixer, -0.1, -20.0)  # -0.1 as negative value
    self.assertRaises(ValueError, AudioMixer,  0.3,  20.0)  # 20.0 as positive value


  def test_err_create_lane_count_over(self):
    audio_mixer = AudioMixer()
    for _ in range(256):
      audio_mixer.create_lane()

    self.assertRaises(MaxLaneReachedError, audio_mixer.create_lane)

    del audio_mixer


  def test_err_lane_id_verify(self):
    """A private method ``__lane_id_verify`` test

    Alternatively, test via ``get_lane_dBFS``.

    """
    audio_mixer = AudioMixer()

    self.assertRaises(TypeError , audio_mixer.get_lane_dBFS, "str") # "str" as non int
    self.assertRaises(ValueError, audio_mixer.get_lane_dBFS, 256)   # over of range
    self.assertRaises(ValueError, audio_mixer.get_lane_dBFS,  -1)   # under of range
    self.assertRaises(KeyError  , audio_mixer.get_lane_dBFS,   0)   # 0 as non existing lane_id


  def test_err_lane_io_arg(self):
    audio_mixer = AudioMixer()
    lane_id = audio_mixer.create_lane()

    self.assertRaises(TypeError, audio_mixer.lane_io, lane_id, "str")

    segment_raw_len = int(AUDIO_PARAM.FRAME_DURATION_SEC * AUDIO_PARAM.SAMPLE_RATE) * AUDIO_PARAM.ONE_SAMPLE_BYTES * AUDIO_PARAM.CHANNELS

    segment_invalid_duration     = AudioSegment(randbytes(segment_raw_len * 2), sample_width=AUDIO_PARAM.ONE_SAMPLE_BYTES, frame_rate=AUDIO_PARAM.SAMPLE_RATE, channels=AUDIO_PARAM.CHANNELS)
    segment_invalid_sample_width = AudioSegment(randbytes(segment_raw_len)    , sample_width=1                           , frame_rate=AUDIO_PARAM.SAMPLE_RATE, channels=AUDIO_PARAM.CHANNELS)
    segment_invalid_sample_rate  = AudioSegment(randbytes(segment_raw_len)    , sample_width=AUDIO_PARAM.ONE_SAMPLE_BYTES, frame_rate=48000                  , channels=AUDIO_PARAM.CHANNELS)
    segment_invalid_channels     = AudioSegment(randbytes(segment_raw_len)    , sample_width=AUDIO_PARAM.ONE_SAMPLE_BYTES, frame_rate=AUDIO_PARAM.SAMPLE_RATE, channels=2                   )

    self.assertRaises(ValueError, audio_mixer.lane_io, lane_id, segment_invalid_duration)
    self.assertRaises(ValueError, audio_mixer.lane_io, lane_id, segment_invalid_sample_width)
    self.assertRaises(ValueError, audio_mixer.lane_io, lane_id, segment_invalid_sample_rate)
    self.assertRaises(ValueError, audio_mixer.lane_io, lane_id, segment_invalid_channels)


  def test_true_set_lane_gain(self):
    audio_mixer = AudioMixer()
    lane_id_in = audio_mixer.create_lane()
    lane_id_out = audio_mixer.create_lane()

    segment_raw_len = int(AUDIO_PARAM.FRAME_DURATION_SEC * AUDIO_PARAM.SAMPLE_RATE) * AUDIO_PARAM.ONE_SAMPLE_BYTES * AUDIO_PARAM.CHANNELS
    segment_in = AudioSegment(randbytes(segment_raw_len), sample_width=AUDIO_PARAM.ONE_SAMPLE_BYTES, frame_rate=AUDIO_PARAM.SAMPLE_RATE, channels=AUDIO_PARAM.CHANNELS)

    audio_mixer.lane_io(lane_id_in, segment_in)
    segment_out_neu: AudioSegment = audio_mixer.lane_io(lane_id_out, segment_in)  # Fetch gained segment_in

    audio_mixer.set_lane_gain(lane_id_in, 10.0)
    audio_mixer.lane_io(lane_id_in, segment_in)
    segment_out_pos: AudioSegment = audio_mixer.lane_io(lane_id_out, segment_in)  # Fetch gained segment_in

    audio_mixer.set_lane_gain(lane_id_in, -10.0)
    audio_mixer.lane_io(lane_id_in, segment_in)
    segment_out_neg: AudioSegment = audio_mixer.lane_io(lane_id_out, segment_in)  # Fetch gained segment_in

    self.assertGreater(segment_out_pos.dBFS, segment_out_neu.dBFS)
    self.assertLess   (segment_out_neg.dBFS, segment_out_neu.dBFS)


  def test_err_set_lane_gain_arg(self):
    audio_mixer = AudioMixer()
    lane_id = audio_mixer.create_lane()

    self.assertRaises(TypeError, audio_mixer.set_lane_gain, lane_id, "str")  # "str" as non float


  def test_true_delete_lane(self):
    audio_mixer = AudioMixer()

    lane_id = audio_mixer.create_lane()
    audio_mixer.get_lane_dBFS(lane_id)  # Should be raise no exception
    audio_mixer.delete_lane(lane_id)
    self.assertRaises(KeyError, audio_mixer.get_lane_dBFS, lane_id) # Raise KeyError means lane is non existing


if __name__ == "__main__":
  unittest.main(verbosity=2)
