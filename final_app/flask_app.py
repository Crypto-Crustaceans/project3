from flask import Flask, render_template, redirect
import get_calendar_data
import run_regression
from flask import jsonify

# Create an instance of Flask
app = Flask(__name__)

@app.route("/")
def home():

    # return template and data
    return render_template("index.html")

@app.route("/data/calendar")
def calendar_data():

    # function to retrieve finance data from postgres
    data = get_calendar_data.get_data()

    # return json
    return data

@app.route("/data/predictions")
def regression():

    # function to retrieve finance data from postgres
    data = run_regression.run_model()

    # return json
    return data

if __name__ == "__main__":
    app.run(debug=True)