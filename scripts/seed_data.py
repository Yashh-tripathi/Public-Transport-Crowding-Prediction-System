# scripts/seed_data.py
import random
import psycopg2

conn = psycopg2.connect(
    dbname="transport_system",
    user="postgres",
    password="Yash@@2400",
    host="localhost",
    port=5432
)

cursor = conn.cursor()

days = ["Monday","Tuesday","Wednesday","Thursday","Friday"]
weather = ["clear","rain"]

for i in range(100):
    route = random.randint(100,110)
    time = random.choice(["8AM","9AM","6PM","7PM"])
    day = random.choice(days)
    w = random.choice(weather)
    passengers = random.randint(50,150)

    cursor.execute(
        "INSERT INTO crowd_data (route_name, time_slot, day, weather, passenger_count) VALUES (%s,%s,%s,%s,%s)",
        (route, time, day, w, passengers)
    )

conn.commit()
conn.close()

print(" 100 dummy records inserted")