# coding: UTF-8
"""Generate a random ``AudioSegment``

Author:
  aKuad

"""

from random import randbytes

from pydub import AudioSegment


def generate_random_audioseg(sample_rate: int, sample_width: int, channels: int, duration_sec: float) -> AudioSegment:
  """Generate a random ``AudioSegment``

  Args:
    sample_rate(int): Sample rate of AudioSegment
    sample_width(int): Width of one sample in bytes
    channels(int): Channel count of AudioSegment
    duration_sec(float): Duration of AudioSegment in seconds

  Returns:
    pydub.AudioSegment: Generated random ``AudioSegment``

  """
  raw = randbytes(int(sample_rate * sample_width * duration_sec)) # Random bytes as random audio data
  return AudioSegment(raw,
                      sample_width=sample_width,
                      frame_rate=sample_rate,
                      channels=channels)
