"""
JarvisLive — AAYAM JARVIS live voice engine.
Mirrors the JarvisLive class from main.py but runs as a background service in FastAPI.
Requires: google-genai, sounddevice, python-dotenv
"""
from __future__ import annotations

import asyncio
import json
import os
import threading
import traceback
from pathlib import Path
from typing import Optional

# State values
STATE_INITIALISING = "INITIALISING"
STATE_LISTENING    = "LISTENING"
STATE_SPEAKING     = "SPEAKING"
STATE_THINKING     = "THINKING"
STATE_PROCESSING   = "PROCESSING"
STATE_MUTED        = "MUTED"
STATE_OFFLINE      = "OFFLINE"
STATE_ERROR        = "ERROR"

LIVE_MODEL          = "models/gemini-2.5-flash-native-audio-preview-12-2025"
CHANNELS            = 1
SEND_SAMPLE_RATE    = 16000
RECEIVE_SAMPLE_RATE = 24000
CHUNK_SIZE          = 1024

BASE_DIR        = Path(__file__).resolve().parents[3]
API_CONFIG_PATH = BASE_DIR / "config" / "api_keys.json"
PROMPT_PATH     = BASE_DIR / "app" / "core" / "prompt.txt"
MEMORY_PATH     = BASE_DIR / "memory" / "jarvis_memory.json"


def _get_api_key() -> str:
    # Try environment variable first
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    # Try config file
    if API_CONFIG_PATH.exists():
        try:
            data = json.loads(API_CONFIG_PATH.read_text(encoding="utf-8"))
            k = data.get("gemini_api_key", "").strip()
            if k:
                return k
        except Exception:
            pass
    raise ValueError(
        "Gemini API key is missing. "
        "Add it to config/api_keys.json or set GEMINI_API_KEY environment variable."
    )


def _load_prompt() -> str:
    try:
        return PROMPT_PATH.read_text(encoding="utf-8")
    except Exception:
        return (
            "You are JARVIS, Aayam's local AI assistant. "
            "Be concise, direct, friendly, and helpful. "
            "Use tools when required. Never pretend tools ran. "
            "Ask approval before local or destructive actions."
        )


class JarvisLive:
    """
    Live voice engine — matches JarvisLive workflow from reference main.py.
    Runs in a background thread; controlled via start()/stop()/mute()/unmute().
    """

    def __init__(self):
        self.state          = STATE_INITIALISING
        self.is_running     = False
        self.is_muted       = False
        self.is_speaking    = False
        self.session        = None
        self.audio_in_queue: Optional[asyncio.Queue] = None
        self.out_queue:      Optional[asyncio.Queue] = None
        self._loop:          Optional[asyncio.AbstractEventLoop] = None
        self._thread:        Optional[threading.Thread] = None
        self._speaking_lock = threading.Lock()
        self._log_callbacks: list = []
        self._state_callbacks: list = []

    # ── public callbacks ───────────────────────────────────────────────────────
    def on_log(self, cb) -> None:
        self._log_callbacks.append(cb)

    def on_state(self, cb) -> None:
        self._state_callbacks.append(cb)

    def _emit_log(self, text: str) -> None:
        for cb in self._log_callbacks:
            try:
                cb(text)
            except Exception:
                pass

    def _set_state(self, state: str) -> None:
        self.state = state
        for cb in self._state_callbacks:
            try:
                cb(state)
            except Exception:
                pass

    # ── control ────────────────────────────────────────────────────────────────
    def start(self) -> dict:
        if self.is_running:
            return {"ok": False, "reason": "Already running."}
        try:
            _get_api_key()
        except ValueError as e:
            return {"ok": False, "reason": str(e)}
        try:
            import sounddevice  # noqa: F401
        except ImportError:
            return {"ok": False, "reason": "sounddevice not installed. Run: pip install sounddevice"}
        try:
            from google import genai  # noqa: F401
        except ImportError:
            return {"ok": False, "reason": "google-genai not installed. Run: pip install google-genai"}

        self.is_running = True
        self._thread = threading.Thread(target=self._run_thread, daemon=True)
        self._thread.start()
        return {"ok": True, "reason": "Live engine starting."}

    def stop(self) -> None:
        self.is_running = False
        if self._loop and self._loop.is_running():
            self._loop.call_soon_threadsafe(self._loop.stop)
        self._set_state(STATE_OFFLINE)
        self._emit_log("SYS: Live voice stopped.")

    def mute(self) -> None:
        self.is_muted = True
        self._set_state(STATE_MUTED)
        self._emit_log("SYS: Microphone muted.")

    def unmute(self) -> None:
        self.is_muted = False
        self._set_state(STATE_LISTENING)
        self._emit_log("SYS: Microphone active.")

    def send_text_command(self, text: str) -> bool:
        if not self._loop or not self.session:
            return False
        asyncio.run_coroutine_threadsafe(
            self.session.send_client_content(
                turns={"parts": [{"text": text}]},
                turn_complete=True,
            ),
            self._loop,
        )
        return True

    # ── internal thread ────────────────────────────────────────────────────────
    def _run_thread(self) -> None:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self._loop = loop
        try:
            loop.run_until_complete(self._run())
        except Exception as e:
            self._emit_log(f"ERR: Live engine crashed: {e}")
        finally:
            self.is_running = False
            self._set_state(STATE_OFFLINE)

    async def _run(self) -> None:
        from google import genai
        from google.genai import types

        api_key = _get_api_key()
        client  = genai.Client(api_key=api_key, http_options={"api_version": "v1beta"})

        while self.is_running:
            try:
                self._emit_log("SYS: Connecting to Gemini Live...")
                self._set_state(STATE_THINKING)
                cfg = self._build_config(types)

                async with (
                    client.aio.live.connect(model=LIVE_MODEL, config=cfg) as session,
                    asyncio.TaskGroup() as tg,
                ):
                    self.session        = session
                    self.audio_in_queue = asyncio.Queue()
                    self.out_queue      = asyncio.Queue(maxsize=10)

                    self._emit_log("SYS: JARVIS live voice online.")
                    self._set_state(STATE_LISTENING)

                    tg.create_task(self._send_realtime())
                    tg.create_task(self._listen_audio())
                    tg.create_task(self._receive_audio(types))
                    tg.create_task(self._play_audio())

            except Exception as e:
                self._emit_log(f"ERR: {e}")
                traceback.print_exc()

            self._speaking_lock_set(False)
            self._set_state(STATE_THINKING)
            if not self.is_running:
                break
            self._emit_log("SYS: Reconnecting in 3s...")
            await asyncio.sleep(3)

    def _speaking_lock_set(self, val: bool) -> None:
        with self._speaking_lock:
            self.is_speaking = val
        if val:
            self._set_state(STATE_SPEAKING)
        elif not self.is_muted:
            self._set_state(STATE_LISTENING)

    def _build_config(self, types):
        from datetime import datetime
        from app.memory.memory_manager import load_memory, format_memory_for_prompt
        prompt  = _load_prompt()
        now_str = datetime.now().strftime("%A, %B %d, %Y — %I:%M %p")
        memory  = load_memory()
        mem_str = format_memory_for_prompt(memory)
        system  = f"[CURRENT DATE & TIME]\nRight now it is: {now_str}\n\n{prompt}"
        if mem_str:
            system += f"\n\n{mem_str}"

        from app.core.tool_declarations import TOOL_DECLARATIONS
        return types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            output_audio_transcription={},
            input_audio_transcription={},
            system_instruction=system,
            tools=[{"function_declarations": TOOL_DECLARATIONS}],
            session_resumption=types.SessionResumptionConfig(),
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Charon")
                )
            ),
        )

    async def _send_realtime(self) -> None:
        while True:
            msg = await self.out_queue.get()
            await self.session.send_realtime_input(media=msg)

    async def _listen_audio(self) -> None:
        import sounddevice as sd
        loop = asyncio.get_event_loop()

        def callback(indata, frames, time_info, status):
            with self._speaking_lock:
                speaking = self.is_speaking
            if not speaking and not self.is_muted:
                try:
                    loop.call_soon_threadsafe(
                        self.out_queue.put_nowait,
                        {"data": indata.tobytes(), "mime_type": "audio/pcm"},
                    )
                except Exception:
                    pass  # queue full — drop frame

        try:
            with sd.InputStream(
                samplerate=SEND_SAMPLE_RATE, channels=CHANNELS,
                dtype="int16", blocksize=CHUNK_SIZE, callback=callback,
            ):
                while self.is_running:
                    await asyncio.sleep(0.1)
        except Exception as e:
            self._emit_log(f"ERR: Microphone failed: {e}")
            raise

    async def _receive_audio(self, types) -> None:
        from app.agent.tool_executor import execute_tool
        out_buf, in_buf = [], []

        try:
            while True:
                async for response in self.session.receive():
                    if response.data:
                        self.audio_in_queue.put_nowait(response.data)

                    if response.server_content:
                        sc = response.server_content
                        if sc.output_transcription and sc.output_transcription.text:
                            self._speaking_lock_set(True)
                            t = sc.output_transcription.text.strip()
                            if t:
                                out_buf.append(t)
                        if sc.input_transcription and sc.input_transcription.text:
                            t = sc.input_transcription.text.strip()
                            if t:
                                in_buf.append(t)
                        if sc.turn_complete:
                            self._speaking_lock_set(False)
                            full_in = " ".join(in_buf).strip()
                            if full_in:
                                self._emit_log(f"You: {full_in}")
                            in_buf = []
                            full_out = " ".join(out_buf).strip()
                            if full_out:
                                self._emit_log(f"Jarvis: {full_out}")
                            out_buf = []

                    if response.tool_call:
                        fn_responses = []
                        for fc in response.tool_call.function_calls:
                            fr = await execute_tool(fc, loop=asyncio.get_event_loop())
                            fn_responses.append(fr)
                        await self.session.send_tool_response(function_responses=fn_responses)

        except Exception as e:
            self._emit_log(f"ERR: Receive loop: {e}")
            raise

    async def _play_audio(self) -> None:
        import sounddevice as sd
        stream = sd.RawOutputStream(
            samplerate=RECEIVE_SAMPLE_RATE, channels=CHANNELS,
            dtype="int16", blocksize=CHUNK_SIZE,
        )
        stream.start()
        try:
            while True:
                chunk = await self.audio_in_queue.get()
                self._speaking_lock_set(True)
                await asyncio.to_thread(stream.write, chunk)
        except Exception as e:
            self._emit_log(f"ERR: Playback: {e}")
            raise
        finally:
            self._speaking_lock_set(False)
            stream.stop()
            stream.close()


# Singleton
_jarvis: Optional[JarvisLive] = None
_log_buffer: list[str] = []
_state_buffer: list[str] = []


def get_jarvis() -> JarvisLive:
    global _jarvis
    if _jarvis is None:
        _jarvis = JarvisLive()
        _jarvis.on_log(lambda t: _log_buffer.append(t))
        _jarvis.on_state(lambda s: _state_buffer.append(s))
    return _jarvis


def pop_logs() -> list[str]:
    logs = list(_log_buffer)
    _log_buffer.clear()
    return logs


def pop_states() -> list[str]:
    states = list(_state_buffer)
    _state_buffer.clear()
    return states
