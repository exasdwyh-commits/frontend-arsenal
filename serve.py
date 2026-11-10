from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    print('WebUI 图鉴  -  http://localhost:8080  (no-cache)')
    ThreadingHTTPServer(('0.0.0.0', 8080), NoCacheHandler).serve_forever()
