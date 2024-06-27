# coding: UTF-8
"""Tests for ``dbfs_ndarray.py``

Test cases:
  * Can calculate dBFS from ``ndarray[int16]``, test by comparing loud pcm and quiet pcm
  * Raise TypeError if invalid argument type is passed
  * Raise RangeError if empty array is passed

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

import numpy as np

from modules.dbfs_ndarray import dbfs_ndarray_int
from modules.packet_conv import AUDIO_PARAM


class Test_dbfs_ndarray(unittest.TestCase):
  def test_true_float(self):
    pcm_loud  = part_create_random_ndarray()
    pcm_quiet = (pcm_loud * 0.1).astype(AUDIO_PARAM.DTYPE)  # Apply gain -20[dB] = 10 ** (-20/20) = 0.1

    dbfs_loud  = dbfs_ndarray_int(pcm_loud)
    dbfs_quiet = dbfs_ndarray_int(pcm_quiet)

    print(f"Loud : {dbfs_loud}")
    print(f"Quiet: {dbfs_quiet}")

    self.assertGreater(dbfs_loud, dbfs_quiet)


  def test_err_float_invalid_type(self):
    pcm_invalid_dtype = part_create_random_ndarray().astype(np.float32)

    self.assertRaises(TypeError, dbfs_ndarray_int, "")  # str "" as non ndarray
    self.assertRaises(TypeError, dbfs_ndarray_int, pcm_invalid_dtype)


  def test_err_float_invalid_value(self):
    pcm_invalid_empty = np.array([], dtype=AUDIO_PARAM.DTYPE)

    self.assertRaises(ValueError, dbfs_ndarray_int, pcm_invalid_empty)


def part_create_random_ndarray() -> np.ndarray:
  # Random bytes as random audio data
  return np.random.randint(-(2**15), (2**15)-1,
                           size=(int(AUDIO_PARAM.SAMPLE_RATE * AUDIO_PARAM.FRAME_DURATION_SEC), AUDIO_PARAM.CHANNELS),
                           dtype=AUDIO_PARAM.DTYPE)


if __name__ == "__main__":
  unittest.main(verbosity=2)
