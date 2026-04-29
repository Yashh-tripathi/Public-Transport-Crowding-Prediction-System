from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import psycopg2

app = Flask(__name__)
model = None
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
        is_pm = "PM" in t

        t = t.replace("AM", "").replace("PM", "")

        if ":" in t:
            num = int(t.split(":")[0])
        else:
            num = int(t)

        if is_pm and num != 12:
            num += 12

        return num

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
    df["is_weekend"] = df["day"].apply(lambda d: 1 if d in ["Saturday","Sunday"] else 0)
    
    X = df[["route", "time", "day_num", "weather_num","is_weekend"]]
    y = df["passenger_count"]
    
    return X,y

# training the model
# X, y = load_data()
# model = RandomForestRegressor()
# model.fit(X,y)
# print("Model trained over the database data")

# ---------- TRAIN FUNCTION ----------
def train_model():
    global model
    X, y = load_data()
    model = RandomForestRegressor()
    model.fit(X, y)
    print("✅ Model retrained on latest DB data")
    
    
@app.route("/retrain", methods=["POST"])
def retrain():
    train_model()
    return jsonify({"message": "Model retrained"})


@app.route("/predict", methods=['POST'])
def predict():
    global model
    if model is None:
        return jsonify({"error": "Model not trained yet"}), 500
    data = request.json
    
    input_df = pd.DataFrame([{
        "route": int(data["route_name"]),
        "time": convert_time(data["time_slot"]),
        "day_num": convert_day(data["day"]),
        "weather_num": convert_weather(data["weather"]),
        "is_weekend": 1 if data["day"] in ["Saturday","Sunday"] else 0
    }])
    
    pred = model.predict(input_df)[0]
    
    return jsonify({
        "predicted_passengers": int(pred)
    })



if __name__ == "__main__":
    train_model()
    app.run(port=9000)