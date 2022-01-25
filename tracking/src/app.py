import newrelic.agent
newrelic.agent.initialize('/app/newrelic.ini')
from flask import Flask
import math 

app = Flask(__name__)

@app.route("/")
def mySlowFunction(id):
    result = 0
    for i in range (id, 10000):
        result += math.atan(i) * math.tan(i)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port='4000')
    mySlowFunction(100)
