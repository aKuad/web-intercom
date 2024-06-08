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
    """Initialize

    Args:
      no_input_detect_sec(float): No mixing what last input was over this seconds
      silent_threshold_dbfs(float): No mixing what under this dbfs audio

    """
    self.__no_input_detect_sec = no_input_detect_sec
    self.__silent_threshold_dbfs = silent_threshold_dbfs


  def create_lane(self) -> int:
    """Create a new lane to add an input

    Returns:
      int: Lane ID what assigned to created lane

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

    """
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

    """
    return self.__lanes[lane_id].dbfs


  def set_lane_gain(self, lane_id: int, gain_db: float):
    """Set gain of a lane

    Gain will be applied at audio mixing in ``lane_io``.

    Args:
      lane_id(int): Lane ID to set gain
      gain_db(float): Gain in dB

    """
    self.__lanes[lane_id].gain = gain_db


  def delete_lane(self, lane_id: int):
    """Delete a lane

    Args:
      lane_id(int): Lane ID to delete

    """
    try:
      self.__lanes.pop(lane_id)
    except:
      pass


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
      BufferError: If lane count already reached to 256

    """
    if len(self.__lanes) >= self.__MAX_LANE_COUNT:
      raise MaxLaneReachedError("Already reached to maximum lane count")

    available_ids = set(range(self.__MAX_LANE_COUNT)) - set(self.__lanes.keys())
    return min(available_ids)
