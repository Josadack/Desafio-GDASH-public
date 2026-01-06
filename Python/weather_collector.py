# weather_collector.py

import os
import time
import json
import threading
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

import requests
import pika
from pika.exceptions import AMQPConnectionError, ProbableAuthenticationError
from dotenv import load_dotenv

# -----------------------------------------------------------
# ENV
# -----------------------------------------------------------
load_dotenv()

RABBIT_URL = os.getenv("RABBIT_URL", "amqp://guest:guest@rabbitmq:5672/")
QUEUE_IN = os.getenv("QUEUE_IN", "weather_queue")
QUEUE_OUT = os.getenv("QUEUE_OUT", "weather_full_queue")
WEATHER_KEY = os.getenv("WEATHER_KEY")
CITY_DEFAULT = os.getenv("CITY", "Guarulhos")
RECONNECT_DELAY = int(os.getenv("RECONNECT_DELAY", "5"))
PORT = int(os.getenv("PORT", "3000"))
KEEP_ALIVE_INTERVAL = int(os.getenv("KEEP_ALIVE_INTERVAL", "60"))  # em segundos

if not WEATHER_KEY:
    print("[WARN] WEATHER_KEY não definido — configure sua key do OpenWeather")

# -----------------------------------------------------------
# Health server (necessário para Render Free)
# -----------------------------------------------------------
class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK")

def start_health_server():
    server = HTTPServer(("0.0.0.0", PORT), HealthHandler)
    print(f"🩺 Health server rodando na porta {PORT}")
    server.serve_forever()

# -----------------------------------------------------------
# Keep-alive para manter o serviço ativo
# -----------------------------------------------------------
def keep_alive():
    url = f"http://localhost:{PORT}/"
    while True:
        try:
            requests.get(url, timeout=5)
            print(f"💓 Keep-alive ping enviado para {url}")
        except Exception as e:
            print(f"[Aviso] Keep-alive falhou: {e}")
        time.sleep(KEEP_ALIVE_INTERVAL)

# -----------------------------------------------------------
# API de clima
# -----------------------------------------------------------
def fetch_weather(city):
    try:
        url = (
            f"http://api.openweathermap.org/data/2.5/weather?"
            f"q={city}&appid={WEATHER_KEY}&units=metric&lang=pt_br"
        )

        resp = requests.get(url, timeout=10)

        if resp.status_code != 200:
            print(f"[ERRO] API retornou {resp.status_code}: {resp.text}")
            return None

        data = resp.json()

        if "main" not in data or "weather" not in data:
            print(f"[ERRO] Resposta inválida: {data}")
            return None

        return {
            "city": city,
            "temperature": float(data["main"].get("temp", 0)),
            "humidity": int(data["main"].get("humidity", 0)),
            "condition": data["weather"][0].get("description", ""),
            "wind_speed": float(data.get("wind", {}).get("speed", 0)),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

    except Exception as e:
        print(f"[ERRO] Falha ao buscar clima ({city}): {e}")
        return None

# -----------------------------------------------------------
# Conexão RabbitMQ (retry infinito)
# -----------------------------------------------------------
def connect_channel():
    params = pika.URLParameters(RABBIT_URL)

    while True:
        try:
            conn = pika.BlockingConnection(params)
            ch = conn.channel()

            ch.queue_declare(queue=QUEUE_IN, durable=True)
            ch.queue_declare(queue=QUEUE_OUT, durable=True)
            ch.basic_qos(prefetch_count=1)

            print("🐇 RabbitMQ conectado com sucesso.")
            return conn, ch

        except (AMQPConnectionError, ProbableAuthenticationError) as e:
            print(f"[Aviso] Falha ao conectar RabbitMQ: {e}. Retentando em {RECONNECT_DELAY}s...")
            time.sleep(RECONNECT_DELAY)
        except Exception as e:
            print(f"[ERRO] Erro inesperado: {e}. Retentando...")
            time.sleep(RECONNECT_DELAY)

# -----------------------------------------------------------
# Callback RabbitMQ
# -----------------------------------------------------------
def on_request(ch, method, properties, body):
    try:
        payload = json.loads(body)
        city = payload.get("city") or CITY_DEFAULT

        print(f"📥 Pedido recebido → Cidade: {city}")

        weather = fetch_weather(city)
        if not weather:
            print(f"[Aviso] Falha ao obter clima de {city}. ACK.")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        ch.basic_publish(
            exchange="",
            routing_key=QUEUE_OUT,
            body=json.dumps(weather).encode("utf-8"),
            properties=pika.BasicProperties(delivery_mode=2)
        )

        print(f"📤 Clima enviado → {QUEUE_OUT}: {weather}")
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print(f"[ERRO] Callback falhou: {e}")
        try:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        except:
            pass

# -----------------------------------------------------------
# Main worker
# -----------------------------------------------------------
def main():
    print("🌤️ Iniciando Weather Collector (Python)...")

    conn, ch = connect_channel()

    print(f"📡 Escutando fila: {QUEUE_IN}")
    ch.basic_consume(queue=QUEUE_IN, on_message_callback=on_request)

    try:
        ch.start_consuming()
    except KeyboardInterrupt:
        print("\n[Worker] Encerrando...")
    finally:
        try:
            conn.close()
        except:
            pass

# -----------------------------------------------------------
# Bootstrap
# -----------------------------------------------------------
if __name__ == "__main__":
    threading.Thread(target=start_health_server, daemon=True).start()
    threading.Thread(target=keep_alive, daemon=True).start()  # Keep-alive ping
    main()
