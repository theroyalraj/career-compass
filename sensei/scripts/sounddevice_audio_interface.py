"""
sounddevice_audio_interface.py — PyAudio-free audio interface for ElevenLabs
Conversational AI SDK using sounddevice (already installed, works on Python 3.14).

Mirrors the exact contract of DefaultAudioInterface so it's a drop-in replacement.
"""
import queue
import threading
from typing import Callable

import numpy as np
import sounddevice as sd

# ElevenLabs expects raw PCM16 at 16kHz mono
SAMPLE_RATE = 16000
CHANNELS = 1
DTYPE = "int16"
INPUT_CHUNK_FRAMES = 4000   # 250ms @ 16kHz  (same as DefaultAudioInterface)
OUTPUT_CHUNK_FRAMES = 1000  # 62.5ms @ 16kHz (same as DefaultAudioInterface)


class SounddeviceAudioInterface:
    """
    Drop-in replacement for elevenlabs DefaultAudioInterface that uses
    sounddevice instead of pyaudio. Works on Python 3.14 + Windows.
    """

    def start(self, input_callback: Callable[[bytes], None]):
        self.input_callback = input_callback
        self.output_queue: queue.Queue[bytes] = queue.Queue()
        self.should_stop = threading.Event()
        self.output_thread = threading.Thread(target=self._output_thread, daemon=True)
        self.output_thread.start()

        # Open input stream (mic → callback)
        self.in_stream = sd.RawInputStream(
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype=DTYPE,
            blocksize=INPUT_CHUNK_FRAMES,
            callback=self._in_callback,
        )
        self.in_stream.start()

    def stop(self):
        self.should_stop.set()
        self.output_thread.join(timeout=2)
        try:
            self.in_stream.stop()
            self.in_stream.close()
        except Exception:
            pass

    def output(self, audio: bytes):
        """Receive PCM16 audio bytes from ElevenLabs and queue for playback."""
        self.output_queue.put(audio)

    def interrupt(self):
        """Clear playback queue immediately (barge-in support)."""
        try:
            while True:
                self.output_queue.get_nowait()
        except queue.Empty:
            pass

    # ── Internal ────────────────────────────────────────────────────────────

    def _in_callback(self, indata, frames, time_info, status):
        """sounddevice mic callback → forward raw bytes to ElevenLabs."""
        if self.input_callback:
            self.input_callback(bytes(indata))

    def _output_thread(self):
        """Drain output queue and play through speakers."""
        with sd.RawOutputStream(
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype=DTYPE,
            blocksize=OUTPUT_CHUNK_FRAMES,
        ) as out_stream:
            while not self.should_stop.is_set():
                try:
                    chunk = self.output_queue.get(timeout=0.25)
                    out_stream.write(chunk)
                except queue.Empty:
                    pass
