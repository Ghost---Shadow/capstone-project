import json

from flask import Flask
from flask import request
from flask import Response

import numpy as np

app = Flask(__name__)

def getPrediction(dataDict):
    dataArray = np.array([dataDict['temperature'],
                          dataDict['moisture'],
                          dataDict['light']],
                         dtype=np.float32)
    dataArray *= .99
    dataArray = dataArray.tolist()
    result = {
        'temperature': dataArray[0],
        'moisture': dataArray[1],
        'light': dataArray[2]
        }
    json_string = json.dumps(result)
    return json_string

@app.route("/", methods=['POST'])
def baseRoute():
    dataDict = request.get_json(force=True)
    responseJson = getPrediction(dataDict)
    return Response(responseJson, mimetype='application/json') 

if __name__ == "__main__":
    app.run()
