# coding: UTF-8
"""Encoding/decoding functions for ``volume_modify`` packet

More detail of packet protocol, see ``packet-protocol.md``

Author:
  aKuad

"""

VOLUME_MODIFY_PACKET_TYPE_ID = 0x20
"""int: Packet type ID of volume modify packet
"""


def encode(lane_id: int, modified_volume: int):
  """Create volume_modify packet

  Args:
    lane_id(int): Lane ID to control
    modified_volume(int): Modified volume value

  Returns:
    bytes: Encoded packet

  Raises:
    TypeError: If ``lane_id`` is not ``int``
    TypeError: If ``modified_volume`` is not ``int``
    ValueError: If ``lane_id`` is not in 0~255
    ValueError: If ``modified_volume`` is not in 0~255

  """
  # Type checking
  if(type(lane_id) != int):
    raise TypeError("lane_id must be integer")
  if(type(modified_volume) != int):
    raise TypeError("modified_volume_value must be integer")

  # Range checking
  if(lane_id < 0 or lane_id > 255):
    raise ValueError("lane_id must be in 0~255")
  if(modified_volume < 0 or modified_volume > 255):
    raise ValueError("modified_volume_value must be in 0~255")

  return bytes([VOLUME_MODIFY_PACKET_TYPE_ID, lane_id, modified_volume])


def decode(raw_packet: bytes) -> tuple[int, int]:
  """Unpack volume_modify packet

  Args:
    raw_packet(bytes): Encoded packet

  Returns:
    tuple[int, int]: Decoded data - Lane ID and modified volume

  Raises:
    TypeError: If ``raw_packet`` is not ``bytes``
    ValueError: If ``raw_packet`` type ID is not volume_modify packet ID
    ValueError: If ``raw_packet`` length is not 3

  """
  # Arguments type checking
  if(type(raw_packet) != bytes):
    raise TypeError("raw_packet must be bytes")

  # Packet type ID checking
  if(raw_packet[0] != VOLUME_MODIFY_PACKET_TYPE_ID):
    raise ValueError("Invalid packet type ID, it is not an volume_modify packet")

  # Arguments range checking
  if(len(raw_packet) != 3):
    raise ValueError("Invalid packet, length must be 3")

  lane_id         = raw_packet[1]
  modified_volume = raw_packet[2]

  return (lane_id, modified_volume)
