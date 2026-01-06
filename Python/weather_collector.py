# weather_collector.py (antigo producer.py)

import os
import time
import json
from datetime import datetime
import requests
import pika
from pika.exceptions import AMQPConnectionError, ProbableAuthenticationError
from dotenv import load_dotenv

load_dotenv()

RABBIT_URL = os.getenv("RABBIT_URL", "amqp://guest:guest@rabbitmq:5672/")
QUEUE_IN = os.getenv("QUEUE_IN", "weather_queue")               # Nest envia cidade
QUEUE_OUT = os.getenv("QUEUE_OUT", "weather_full_queue")       # Python envia clima pronto
WEATHER_KEY = os.getenv("WEATHER_KEY")
CITY_DEFAULT = os.getenv("CITY", "Guarulhos")
RECONNECT_DELAY = int(os.getenv("RECONNECT_DELAY", "5"))

if not WEATHER_KEY:
    print("[WARN] WEATHER_KEY não definido — configure sua key do OpenWeather no .env")

# -----------------------------------------------------------
# API de clima
# -----------------------------------------------------------
def fetch_weather(city):
    """Chama OpenWeather e normaliza o resultado."""
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
# Conexão com RabbitMQ com retry infinito
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
            print(f"[ERRO] Erro inesperado ao conectar: {e}. Retentando...")
            time.sleep(RECONNECT_DELAY)


# -----------------------------------------------------------
# Callback ao receber cidade do NestJS
# -----------------------------------------------------------
def on_request(ch, method, properties, body):
    try:
        payload = json.loads(body)
        city = payload.get("city") or CITY_DEFAULT

        print(f"📥 Pedido recebido → Cidade: {city}")

        weather = fetch_weather(city)
        if not weather:
            print(f"[Aviso] Não foi possível obter clima para {city}. ACK e continua.")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        out_body = json.dumps(weather)

        ch.basic_publish(
            exchange="",
            routing_key=QUEUE_OUT,
            body=out_body.encode("utf-8"),
            properties=pika.BasicProperties(delivery_mode=2)
        )

        print(f"📤 Clima enviado → {QUEUE_OUT}: {weather}")

        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print(f"[ERRO] Falha no callback: {e}")
        try:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        except:
            pass


# -----------------------------------------------------------
# Main
# -----------------------------------------------------------
def main():
    print("🌤️ Iniciando Weather Collector (Python)...")

    conn, ch = connect_channel()

    print(f"📡 Escutando fila: {QUEUE_IN}")
    ch.basic_consume(queue=QUEUE_IN, on_message_callback=on_request)

    try:
        ch.start_consuming()
    except KeyboardInterrupt:
        print("\n[Producer] Encerrando...")
    finally:
        try:
            conn.close()
        except:
            pass


if __name__ == "__main__":
    main()
