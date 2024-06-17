# coding: UTF-8
"""dBFS measuring utility

Run this script, then current mic input dBFS will be printed at each 0.1 sec.

Ctrl + C to exit.

For requirements install: `pip install sounddevice pydub`

Author:
  aKuad

"""

import sounddevice
from pydub import AudioSegment


if __name__ == "__main__":
  try:
    while True:
      rec = sounddevice.rec(4410, 44100, 1, "int16", blocking=True)
      seg = AudioSegment(rec.tobytes(), sample_width=2, frame_rate=44100, channels=1)
      print(seg.dBFS)
  except KeyboardInterrupt:
    pass
