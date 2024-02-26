# coding: UTF-8

import curses
from curses import window
from uuid import uuid4
from dataclasses import dataclass


@dataclass
class MixerTUILane:
  """Mixer lane info data structure

  Attributes:
    fader (int): User controlled value
    name (str) : Name of view in console

  """
  fader: int
  name: str


class MixerTUI:
  """View audio mixing console on terminal

  Attributes:
    __CONSOLE_WIDTH (int)            : Total view width in string count
    __FADER_WIDTH (int)              : View width of fader, lane name and some chars removed count
    __screen (curses.window)         : Screen object of curses
    __lanes (dict[int, MixerTUILane]): Lanes data dict - key: id, value: data struct
    __lane_current_index (int)       : Current lane index

  """

  __CONSOLE_WIDTH = 40
  __FADER_WIDTH = __CONSOLE_WIDTH - 6   # Lane-name(3) + '|' + '[' + ']' = 6 chars
  __screen: window
  __lanes: dict[int, MixerTUILane] = {}
  __lane_current_index = -1 # -1 means no lanes


  def __init__(self, screen: window):
    """Start console on curses window

    Args:
      screen (window): Window object of curses to draw console

    """
    curses.curs_set(0)
    self.__screen = screen
    self.__screen.addstr(0, 0, ("Mixer Console" + "-" * self.__CONSOLE_WIDTH)[:self.__CONSOLE_WIDTH])


  def create_lane(self, name: str, lane_id: int | None = None) -> int:
    """Create new lane and view in console

    Args:
      name (str)   : Name of view in console
      lane_id (int): ID of new lane, if none, generate

    Returns:
      int: ID of created lane

    Note:
      Lane name can display only 3 characters. Over 4 will be cut.

    """
    if lane_id == None:
      lane_id = uuid4().int

    name_adj = (name + "   ")[:3] # Set 3 length, empty fill with spaces, over will cut
    self.__lanes[lane_id] = MixerTUILane(self.__FADER_WIDTH // 2, name_adj)

    y = self.__lane_id2fader_ypos(lane_id)
    self.__screen.addstr(y, 0, f"{name_adj} [" + (" " * self.__FADER_WIDTH) + "]\n")
    self.__screen.addstr(              "    [" + (" " * self.__FADER_WIDTH) + "]")
    self.__print_bar(y, self.__lanes[lane_id].fader)

    if self.__lane_current_index == -1:
      self.__lane_current_index = 0
      self.__print_lane_names()

    return lane_id


  def delete_lane(self, lane_id: int):
    """Delete a lane from console

    Args:
      lane_id (int): Lane ID to delete

    """
    y = self.__lane_id2fader_ypos(lane_id)
    self.__screen.move(y, 0)
    self.__screen.deleteln()
    self.__screen.deleteln()

    self.__lanes.pop(lane_id)

    if len(self.__lanes) == 0:  # No lanes
      self.__lane_current_index = -1
    elif self.__lane_current_index > len(self.__lanes) - 1: # Current is out of range
      self.__lane_current_index -= 1
      self.__print_lane_names()


  def wait_key_control(self):
    """Accept key control of console

    Note:
      This function stops the current routine until any key input

    """
    key_in = self.__screen.getch()

    # No lanes, do nothing
    if self.__lane_current_index == -1:
      return

    if   key_in == curses.KEY_UP:
      if self.__lane_current_index > 0:
        self.__lane_current_index -= 1
        self.__print_lane_names()

    elif key_in == curses.KEY_DOWN:
      if self.__lane_current_index < len(self.__lanes) - 1:
        self.__lane_current_index += 1
        self.__print_lane_names()

    elif key_in == curses.KEY_RIGHT:
      lane_current_id = self.__lane_index2id(self.__lane_current_index)
      if self.__lanes[lane_current_id].fader < self.__FADER_WIDTH:
        self.__lanes[lane_current_id].fader += 1
        self.__print_bar(self.__lane_id2fader_ypos(lane_current_id), self.__lanes[lane_current_id].fader)

    elif key_in == curses.KEY_LEFT:
      lane_current_id = self.__lane_index2id(self.__lane_current_index)
      if self.__lanes[lane_current_id].fader > 0:
        self.__lanes[lane_current_id].fader -= 1
        self.__print_bar(self.__lane_id2fader_ypos(lane_current_id), self.__lanes[lane_current_id].fader)


  def __print_lane_names(self):
    for i, lane in enumerate(self.__lanes.values()):
      if i == self.__lane_current_index:
        self.__screen.addstr(i * 2 + 1, 0, lane.name, curses.A_REVERSE)
      else:
        self.__screen.addstr(i * 2 + 1, 0, lane.name)


  def __print_bar(self, y_pos: int, value: int):
    self.__screen.addstr(y_pos, 5, " " * value, curses.A_REVERSE)
    self.__screen.addstr(          " " * (self.__FADER_WIDTH - value))


  def get_fader_value(self, lane_id: int) -> float:
    """Get fader value from lane ID

    Args:
      lane_id (int): Lane ID to get value

    Returns:
      Fader value as float in 0.0 ~ 1.0

    """
    return self.__lanes[lane_id].fader / self.__FADER_WIDTH


  def set_meter_value(self, lane_id: int, value: float):
    """Meter view update

    Args:
      lane_id (int): Lane ID to update
      value (float): Value in 0.0 ~ 1.0

    """
    if   value < 0.0:
      value = 0.0
    elif value > 1.0:
      value = 1.0

    self.__print_bar(self.__lane_id2fader_ypos(lane_id) + 1, int(self.__FADER_WIDTH * value))
    #                        + 1 for meter pos


  def __lane_id2index(self, lane_id: int):
    return list(self.__lanes.keys()).index(lane_id)


  def __lane_index2id(self, lane_index: int):
    return list(self.__lanes.keys())[lane_index]


  def __lane_id2fader_ypos(self, lane_id: int):
    lane_index = self.__lane_id2index(lane_id)
    return (lane_index * 2) + 1
    # * 2 for meter view index, + 1 for console head offset
