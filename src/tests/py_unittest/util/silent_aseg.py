# coding: UTF-8
"""Create a silent ``AudioSegment``

Author:
  aKuad

"""

from pydub import AudioSegment


def create_silent_aseg(sample_rate: int, sample_width: int, channels: int, duration_sec: float) -> AudioSegment:
  """Create a silent ``AudioSegment``

  Note:
    Also `AudioSegment.silent()` can create a silent AudioSegment.
    But this method has no parameter of sample_width and channels. (But may be it occurs no problems.)

  Args:
    sample_rate(int): Sample rate of AudioSegment
    sample_width(int): Width of one sample in bytes
    channels(int): Channel count of AudioSegment
    duration_sec(float): Duration of AudioSegment in seconds

  Returns:
    pydub.AudioSegment: Generated silent ``AudioSegment``

  """
  raw = bytes(int(sample_rate * sample_width * duration_sec))
  return AudioSegment(raw,
                      sample_width=sample_width,
                      frame_rate=sample_rate,
                      channels=channels)
