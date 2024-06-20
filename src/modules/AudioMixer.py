# coding: UTF-8
"""Audio mixer module

Audio mixing, with ignoring own input and no recent input (suppose unstable connection).

Author:
  aKuad

"""

from dataclasses import dataclass
from time import time

from pydub import AudioSegment

from .packet_conv import AUDIO_PARAM


@dataclass
class AudioMixerLane:
  segment: AudioSegment
  gain: float
  last_input_ts: float
  dbfs: float


class MaxLaneReachedError(Exception):
  """Exception for no more lanes can be created

  It will be raised when tried to create over 256 lanes.

  """
  pass


class AudioMixer:
  """Audio mixer module

  Attributes:
    __MAX_LANE_COUNT(int): Maximum number of lanes
    __lanes(dict[int, AudioMixerLane]): Lanes data and properties, this dict key means ``lane_id``
    __no_input_detect_sec(float): Over this seconds elapsed input will be ignored
    __silent_threshold_dbfs(float): Under this dBFS input will be ignored

  """
  __MAX_LANE_COUNT: int = 256
  __lanes: dict[int, AudioMixerLane] = {}
  __no_input_detect_sec: float
  __silent_threshold_dbfs: float


  def __init__(self, no_input_detect_sec: float = 0.3, silent_threshold_dbfs: float = -20.0):
    """Initialize with parameters setting

    Args:
      no_input_detect_sec(float): No mixing what last input was over this seconds
      silent_threshold_dbfs(float): No mixing what under this dbfs audio

    Raises:
      TypeError: If ``no_input_detect_sec`` is not ``float``
      TypeError: If ``silent_threshold_dbfs`` is not ``float``
      ValueError: If ``no_input_detect_sec`` is not greater than 0.0
      ValueError: If ``silent_threshold_dbfs`` is not less than 0.0

    """
    # Arguments type checking
    if(type(no_input_detect_sec) != float):
      raise TypeError(f"no_input_detect_sec must be int, but got {type(no_input_detect_sec)}")
    if(type(silent_threshold_dbfs) != float):
      raise TypeError(f"silent_threshold_dbfs must be int, but got {type(silent_threshold_dbfs)}")

    # Arguments range checking
    if(no_input_detect_sec < 0.0):
      raise ValueError("no_input_detect_sec must be greater than 0.0")
    if(silent_threshold_dbfs > 0.0):
      raise ValueError("silent_threshold_dbfs must be less than 0.0")

    self.__lanes = {}
    self.__no_input_detect_sec = no_input_detect_sec
    self.__silent_threshold_dbfs = silent_threshold_dbfs


  def create_lane(self) -> int:
    """Create a new lane to add an input

    Returns:
      int: Lane ID what assigned to created lane

    Raises:
      MaxLaneReachedError: If lane count already reached to 256

    """
    lane_id = self.__lookup_available_lane_id()
    self.__lanes[lane_id] = AudioMixerLane(self.__create_silent_segment(), 0.0, time(), -float("inf"))
    return lane_id


  def lane_io(self, lane_id: int, segment: AudioSegment) -> AudioSegment:
    """Input processing and return mixed audio

    Args:
      lane_id(int): Lane ID to control
      segment(AudioSegment): Audio to input as specified lane

    Returns:
      AudioSegment: Mixed audio (without own input audio)

    Raises:
      TypeError: If ``lane_id`` is not ``int``
      ValueError: If ``lane_id`` is not in 0~255
      KeyError: If non existing ``lane_id`` was specified
      TypeError: If ``segment`` is not ``AudioSegment``
      ValueError: If ``segment`` duration is not match with config at ``AUDIO_PARAM``
      ValueError: If ``segment`` sample width is not match with config at ``AUDIO_PARAM``
      ValueError: If ``segment`` frame rate is not match with config at ``AUDIO_PARAM``
      ValueError: If ``segment`` channels is not match with config at ``AUDIO_PARAM``

    """
    self.__lane_id_verify(lane_id)

    # Arguments type checking
    if(type(segment) != AudioSegment):
      raise TypeError(f"segment must be AudioSegment, but got {type(segment)}")

    # segment checking
    if(segment.duration_seconds != AUDIO_PARAM.FRAME_DURATION_SEC):
      raise ValueError(f"segment duration expected {AUDIO_PARAM.FRAME_DURATION_SEC}, but got {segment.duration_seconds}")
    if(segment.sample_width != AUDIO_PARAM.ONE_SAMPLE_BYTES):
      raise ValueError(f"segment sample_width expected {AUDIO_PARAM.ONE_SAMPLE_BYTES}, but got {segment.sample_width}")
    if(segment.frame_rate != AUDIO_PARAM.SAMPLE_RATE):
      raise ValueError(f"segment frame_rate expected {AUDIO_PARAM.FRAME_DURATION_SEC}, but got {segment.frame_rate}")
    if(segment.channels != AUDIO_PARAM.CHANNELS):
      raise ValueError(f"segment channels expected {AUDIO_PARAM.CHANNELS}, but got {segment.channels}")

    time_now = time()
    self.__lanes[lane_id].segment       = segment + self.__lanes[lane_id].gain
    self.__lanes[lane_id].last_input_ts = time_now
    self.__lanes[lane_id].dbfs          = self.__lanes[lane_id].segment.dBFS

    mixed = self.__create_silent_segment()
    for lane_id_i in self.__lanes.keys():
      if lane_id_i == lane_id:
        continue  # Ignore own audio
      if (time_now - self.__lanes[lane_id_i].last_input_ts) > self.__no_input_detect_sec:
        continue  # Ignore no recent input lane
      if self.__lanes[lane_id_i].dbfs < self.__silent_threshold_dbfs:
        continue  # Ignore too small input lane
      mixed = mixed.overlay(self.__lanes[lane_id_i].segment)

    return mixed


  def get_lane_dBFS(self, lane_id: int) -> float:
    """Fetch loudness (dBFS) of a lane

    Args:
      lane_id(int): Lane ID to fetch loudness

    Returns:
      float: Loudness in dBFS

    Raises:
      TypeError: If ``lane_id`` is not ``int``
      ValueError: If ``lane_id`` is not in 0~255
      KeyError: If non existing ``lane_id`` was specified

    """
    self.__lane_id_verify(lane_id)
    return self.__lanes[lane_id].dbfs


  def set_lane_gain(self, lane_id: int, gain_db: float):
    """Set gain of a lane

    Gain will be applied at audio mixing in ``lane_io``.

    Args:
      lane_id(int): Lane ID to set gain
      gain_db(float): Gain in dB

    Raises:
      TypeError: If ``lane_id`` is not ``int``
      TypeError: If ``gain_db`` is not ``float``
      ValueError: If ``lane_id`` is not in 0~255
      KeyError: If non existing ``lane_id`` was specified

    """
    self.__lane_id_verify(lane_id)

    # Arguments type checking
    if(type(gain_db) != float):
      raise TypeError(f"gain_db must be float, but got {type(gain_db)}")

    self.__lanes[lane_id].gain = gain_db


  def delete_lane(self, lane_id: int):
    """Delete a lane

    Args:
      lane_id(int): Lane ID to delete

    Raises:
      TypeError: If ``lane_id`` is not ``int``
      ValueError: If ``lane_id`` is not in 0~255
      KeyError: If non existing ``lane_id`` was specified

    """
    self.__lane_id_verify(lane_id)
    self.__lanes.pop(lane_id)


  def __create_silent_segment(self) -> AudioSegment:
    """Create a silent segment for specified duration in ``AUDIO_PARAM.py``

    Returns:
      AudioSegment: Silent audio segment

    """
    return AudioSegment.silent(int(AUDIO_PARAM.FRAME_DURATION_SEC * 1000), AUDIO_PARAM.SAMPLE_RATE)


  def __lookup_available_lane_id(self) -> int:
    """Return available smallest lane ID

    Returns:
      int: Available smallest lane ID (0~255)

    Raises:
      MaxLaneReachedError: If lane count already reached to 256

    """
    if len(self.__lanes) >= self.__MAX_LANE_COUNT:
      raise MaxLaneReachedError("Already reached to maximum lane count")

    available_ids = set(range(self.__MAX_LANE_COUNT)) - set(self.__lanes.keys())
    return min(available_ids)


  def __lane_id_verify(self, lane_id) -> None:
    """Lane ID verification - type, range and existing

    Raises:
      TypeError: If ``lane_id`` is not ``int``
      ValueError: If ``lane_id`` is not in 0~255
      KeyError: If non existing ``lane_id`` was specified

    """
    # Type checking
    if(type(lane_id) != int):
      raise TypeError(f"lane_id must be int, but got {type(lane_id)}")

    # Range checking
    if(lane_id not in range(256)):
      raise ValueError(f"lane_id must be 0~255")

    # lane_id existing checking
    if(lane_id not in self.__lanes.keys()):
      raise KeyError(f"The lane id {lane_id} is not exist")
