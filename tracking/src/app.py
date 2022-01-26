import newrelic.agent
newrelic.agent.initialize('/app/newrelic.ini')
from flask import Flask
import math 

app = Flask(__name__)

@app.route("/")
def mySlowFunction(id=100):
    result = 0
    for i in range (id, 100000000):
        result += math.atan(i) * math.tan(i)
    return 'OK'

if __name__ == "__main__":
    app.run(debug=True, port='4000')
    mySlowFunction()

