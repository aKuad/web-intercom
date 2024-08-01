# coding: UTF-8
"""Audio data parameters at this system

It for avoid magic-number coding. And keep same parameters at all modules.

Author:
  aKuad

"""

SAMPLE_RATE = 44100
FRAME_DURATION_SEC = 0.1
ONE_FRAME_SAMPLES = 4410  # = SAMPLE_RATE * FRAME_DURATION_SEC
CHANNELS = 1
DTYPE = "int16"
ONE_SAMPLE_BYTES = 2
