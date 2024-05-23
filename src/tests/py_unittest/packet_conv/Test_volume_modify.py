# coding: UTF-8
"""Tests for ``packet_conv/volume_modify.py``

Test cases:
  * Can encode/decode volume modify packet
  * Raise TypeError if invalid argument is passed
  * Raise ValueError if invalid argument is passed

Test steps:
  * Run this script by unittest - ``python3 -m unittest discover "Test_*.py"``

Note:
  Specification of ``volume_modify`` packet, see ``/designs/packet-protocols.md``

"""

# For import top layer module
import sys
from pathlib import Path
sys.path.append(Path(__file__).absolute().parent.parent.parent.__str__())


import unittest

from uuid import uuid4

from modules.packet_conv import volume_modify


class Test_packet_conv_volume_modify(unittest.TestCase):
  def test_true_enc_dec(self):
    lane_id_org = 1
    modified_volume_org = 100
    raw_packet = volume_modify.encode(lane_id_org, modified_volume_org)
    lane_id_prc, modified_volume_prc = volume_modify.decode(raw_packet)

    self.assertEqual(lane_id_org, lane_id_prc)
    self.assertEqual(modified_volume_org, modified_volume_prc)


  def test_err_enc_invalid_type(self):
    self.assertRaises(TypeError, volume_modify.encode, "", 0) # str "" as non int
    self.assertRaises(TypeError, volume_modify.encode, 0, "") # str "" as non int


  def test_err_enc_invalid_value(self):
    self.assertRaises(ValueError, volume_modify.encode, -1 , 0) # under range
    self.assertRaises(ValueError, volume_modify.encode, 256, 0) # over range
    self.assertRaises(ValueError, volume_modify.encode, 0, -1)  # under range
    self.assertRaises(ValueError, volume_modify.encode, 0, 256) # over range


  def test_err_dec_invalid_type(self):
    self.assertRaises(TypeError, volume_modify.decode, "")  # str "" as non bytes


  def test_err_dec_invalid_value(self):
    raw_packet_invalid_id = b"A" + bytes([1, 2])
    #                       ~~~~ as non 0x20 byte
    raw_packet_invalid_len = bytes([volume_modify.VOLUME_MODIFY_PACKET_TYPE_ID, 1])
    # modified volume missing packet

    self.assertRaises(ValueError, volume_modify.decode, raw_packet_invalid_id)
    self.assertRaises(ValueError, volume_modify.decode, raw_packet_invalid_len)


if __name__ == "__main__":
  unittest.main(verbosity=2)
