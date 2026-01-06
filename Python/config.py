
import os


RABBIT_URL = os.getenv("RABBIT_URL", "amqp://guest:guest@rabbitmq:5672/")
QUEUE_IN = os.getenv("QUEUE_IN", "weather_queue")
QUEUE_OUT = os.getenv("QUEUE_OUT", "weather_full_queue")
INTERVAL_SECONDS = int(os.getenv("INTERVAL_SECONDS", "3600"))
WEATHER_KEY = os.getenv("WEATHER_KEY")
CITY = os.getenv("CITY", "Guarulhos")

RECONNECT_DELAY = int(os.getenv("RECONNECT_DELAY", 5))

