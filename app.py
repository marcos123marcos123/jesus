#!/usr/bin/env python3
"""
Proyecto Jesús — servidor local multiplataforma.
Uso: python app.py
Funciona en Termux, Windows, macOS y Linux (Python 3.7+).
"""

import os
import json
import sys
import time
import socket
import shutil
import threading
import webbrowser
import subprocess
from pathlib import Path
from datetime import datetime
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

HOST = '127.0.0.1'
DEFAULT_PORT = 8080
ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)



RESULTS_FILE = ROOT / 'results.json'

def _load_results():
    if RESULTS_FILE.exists():
        try:
            return json.loads(RESULTS_FILE.read_text(encoding='utf-8'))
        except Exception:
            return []
    return []

def _save_results(data):
    RESULTS_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            pass

    def log_message(self, fmt, *args):
        if args and len(args) > 1 and str(args[1]).startswith(('4', '5')):
            print(f"  ! {fmt % args}")

    def do_POST(self):
        if self.path.rstrip('/') == '/api/results':
            try:
                length = int(self.headers.get('Content-Length', 0))
                raw = self.rfile.read(length).decode('utf-8')
                payload = json.loads(raw)
                entry = {
                    'id': int(datetime.now().timestamp() * 1000),
                    'receivedAt': datetime.now().isoformat(timespec='seconds'),
                    'team': payload.get('team', []),
                    'quiz': payload.get('quiz', {}),
                    'reflections': payload.get('reflections', {}),
                }
                data = _load_results()
                data.append(entry)
                _save_results(data)
                self._json(200, {'ok': True, 'entry': entry})
            except Exception as e:
                self._json(400, {'ok': False, 'error': str(e)})
            return
        self.send_error(404)

    def do_GET(self):
        if self.path.rstrip('/') == '/api/results':
            self._json(200, {'ok': True, 'results': _load_results()})
            return
        if self.path == '/admin/':
            self.send_response(301)
            self.send_header('Location', '/admin')
            self.end_headers()
            return
        if self.path == '/admin':
            return self._serve_file('results.html', 'text/html; charset=utf-8')
        super().do_GET()

    def do_DELETE(self):
        prefix = '/api/results/'
        if self.path.startswith(prefix):
            try:
                rid = int(self.path[len(prefix):].rstrip('/'))
                data = _load_results()
                new_data = [r for r in data if r.get('id') != rid]
                if len(new_data) == len(data):
                    self._json(404, {'ok': False, 'error': 'not found'})
                    return
                _save_results(new_data)
                self._json(200, {'ok': True, 'deleted': rid})
            except Exception as e:
                self._json(400, {'ok': False, 'error': str(e)})
            return
        self.send_error(404)

    def _serve_file(self, filename, ctype):
        fpath = ROOT / filename
        if not fpath.exists():
            self.send_error(404)
            return
        content = fpath.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(content)

    def _json(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)


def find_free_port(start=DEFAULT_PORT, end=None):
    end = end or (start + 100)
    for port in range(start, end):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((HOST, port))
                return port
            except OSError:
                continue
    return None


def is_termux():
    return ('com.termux' in os.environ.get('PREFIX', '')
            or os.path.isdir('/data/data/com.termux'))


def open_browser(url):
    if is_termux() and shutil.which('termux-open-url'):
        try:
            subprocess.Popen(['termux-open-url', url],
                             stdout=subprocess.DEVNULL,
                             stderr=subprocess.DEVNULL)
            return True
        except Exception:
            pass
    try:
        if webbrowser.open(url):
            return True
    except Exception:
        pass
    try:
        if sys.platform.startswith('win'):
            os.startfile(url)
            return True
        if sys.platform == 'darwin':
            subprocess.Popen(['open', url])
            return True
        if shutil.which('xdg-open'):
            subprocess.Popen(['xdg-open', url],
                             stdout=subprocess.DEVNULL,
                             stderr=subprocess.DEVNULL)
            return True
    except Exception:
        pass
    return False


def main():
    required = ['index.html', 'styles.css', 'app.js']
    missing = [f for f in required if not (ROOT / f).exists()]
    if missing:
        print("\n  X Faltan archivos en esta carpeta:")
        for f in missing:
            print(f"     - {f}")
        print(f"\n  Carpeta: {ROOT}\n")
        sys.exit(1)

    port = find_free_port()
    if port is None:
        print("\n  X No se encontro un puerto libre entre 8080 y 8180.\n")
        sys.exit(1)

    url = f"http://{HOST}:{port}/"

    print()
    print("  +===============================================+")
    print("  |   PROYECTO JESUS - servidor local             |")
    print("  +===============================================+")
    print(f"  Carpeta : {ROOT}")
    print(f"  URL     : {url}")
    print(f"  Detener : Ctrl + C")
    print()

    try:
        server = ThreadingHTTPServer((HOST, port), Handler)
    except OSError as e:
        print(f"\n  X No se pudo iniciar el servidor: {e}\n")
        sys.exit(1)

    def open_later():
        time.sleep(0.6)
        if open_browser(url):
            print("  -> Navegador abierto.\n")
        else:
            print(f"  -> Abre manualmente: {url}\n")

    threading.Thread(target=open_later, daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n  Servidor detenido. Hasta pronto!\n")
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
