from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import psycopg2

app = Flask(__name__)

# helpers
def convert_day(day):
    days = {
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6,
        "Sunday": 7
    }
    return days.get(day,1)

def convert_time(t):
    t = str(t).strip().upper()

    try:
        if "AM" in t or "PM" in t:
            num = int(t.split("A")[0].split("P")[0])
            if "PM" in t and num != 12:
                num += 12
            return num

        if ":" in t:
            return int(t.split(":")[0])

        return int(t)

    except Exception as e:
        print("Time conversion error:", t, e)
        return 0

def convert_weather(w):
    return 1 if w.lower() == "rain" else 0


# fetching data from db 
def load_data():
    conn = psycopg2.connect(
        dbname = 'transport_system',
        user='postgres',
        password='Yash@@2400',
        host='localhost',
        port=5432
    )
    
    query = 'SELECT * FROM crowd_data'
    df = pd.read_sql(query, conn)
    
    conn.close()
    
    #transform
    df['route'] = df['route_name'].astype(int)
    df['time'] = df['time_slot'].apply(convert_time)
    df['day_num'] = df['day'].apply(convert_day)
    df['weather_num'] = df['weather'].apply(convert_weather)
    
    X = df[["route", "time", "day_num", "weather_num"]]
    y = df["passenger_count"]
    
    return X,y

# training the model
X, y = load_data()
model = RandomForestRegressor()
model.fit(X,y)
print("Model trained over the database data")

@app.route("/predict", methods=['POST'])
def predict():
    data = request.json
    
    input_df = pd.DataFrame([{
        "route": int(data["route_name"]),
        "time": convert_time(data["time_slot"]),
        "day_num": convert_day(data["day"]),
        "weather_num": convert_weather(data["weather"])
    }])
    
    pred = model.predict(input_df)[0]
    
    return jsonify({
        "predicted_passengers": int(pred)
    })



if __name__ == "__main__":
    app.run(port=9000)