# coding: UTF-8
"""Try for ``MixerTUI.py``

To try features:
  * Can add/delete lane
  * Can toggle current lane and move fader
  * Can view value in meter

Author:
  aKuad

"""

# For import top layer module
import sys
from pathlib import Path
sys.path.append(Path(__file__).absolute().parent.parent.parent.__str__())

import curses
from random import random

from modules.MixerTUI import MixerTUI


def main(stdscr: curses.window):
  console = MixerTUI(stdscr)

  lane_mod_timer = 0

  id1 = console.create_lane("CL1")
  id2 = console.create_lane("CL2")
  id3 = console.create_lane("CL3")

  while True:
    console.wait_key_control()

    console.set_meter_value(id1, random())
    console.set_meter_value(id2, random())

    if id3 != None:
      console.set_meter_value(id3, random())

    # Try adding and deleting
    lane_mod_timer += 1
    if lane_mod_timer >= 10:
      lane_mod_timer = 0
      if id3 == None:
        id3 = console.create_lane("CL3")
      else:
        console.delete_lane(id3)
        id3 = None


if __name__ == "__main__":
  try:
    curses.wrapper(main)
  except KeyboardInterrupt:
    print("End")
