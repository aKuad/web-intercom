# coding: UTF-8
"""Simple HTTP server for server connection required JavaScript modules tests

Note:
  About test details, see each testing HTML codes.

Requirements:
  Some additional modules are required.
  To install them::

    pip install fastapi jinja2 uvicorn

Author:
  aKuad

"""

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from uvicorn import run


app = FastAPI()
app.mount("/static", StaticFiles(directory="../../static"), name="static")
templates = Jinja2Templates(directory="./")


@app.get("/raw_mic_capture")
def RawMicCaptureProcessor(request: Request):
  """
  URL: http://localhost:8000/raw_mic_capture
  """
  return templates.TemplateResponse("Test_raw_mic_capture.html", {"request": request})


@app.get("/RawAudioStreamPlay")
def RawMicCaptureProcessor(request: Request):
  """
  URL: http://localhost:8000/RawAudioStreamPlay
  """
  return templates.TemplateResponse("Try_RawAudioStreamPlay.html", {"request": request})


if __name__ == "__main__":
  run("main:app", reload=True)
