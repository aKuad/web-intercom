# coding: UTF-8
"""dBFS calculating function

Author:
  aKuad

"""

from numpy import ndarray, sqrt, log10, int8, int16, int32, int64, iinfo
from numpy import sum as np_sum


def dbfs_ndarray_int(frame_array: ndarray) -> float:
  """Calculate dBFS from int array

  Note:
    It supports signed int arrays (without ``int64``). Not for unsigned int arrays.
    ``int64`` is not supported because too big value what cannot calculate.

  Args:
    frame_array(ndarray): Audio PCM frame array

  Returns:
    float: dBFS value

  Raises:
    TypeError: If ``frame_array`` is not ``ndarray``
    TypeError: If ``frame_array`` dtype is not ``int8``, ``int16`` or ``int32``
    ValueError: If ``frame_array`` is empty array

  """
  # Arguments type checking
  if(type(frame_array) != ndarray):
    raise TypeError(f"frame_array must be ndarray, but got {type(frame_array)}")

  # ndarray dtype checking
  if(frame_array.dtype not in [int8, int16, int32]):
    raise TypeError(f"frame_array dtype expected int8, int16 or int32, but got {frame_array.dtype}")

  # Content availability checking
  if(frame_array.size == 0):
    raise ValueError("Empty array passed")

  AMPLITUDE_HIGH = iinfo(frame_array.dtype).max

  sq_sum = np_sum(frame_array.flatten().astype(int64) ** 2)
  rms = sqrt(sq_sum / frame_array.size)

  return 20 * log10(rms / AMPLITUDE_HIGH)


# For float16, float32, float64, float96 and float128 is unimplemented.
# It will be implemented if it required.
# def dbfs_ndarray_float(frame_array) {}
