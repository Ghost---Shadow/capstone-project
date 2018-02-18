'''
This module deploys the trained keras model
'''
import json

from flask import Flask
from flask import request
from flask import Response

import numpy as np

from keras.models import load_model

from utils import normalize, denormalize

# Load the keras model
MODEL_PATH = './model.h5'
model = load_model(MODEL_PATH)
print('model loaded')

app = Flask(__name__)

def getPrediction(values):
    '''
    Uses the model to predict values and returns a JSON
    '''
    try:
        values = np.array([values['light'],
                           values['moisture'],
                           values['temperature']], dtype=np.float32)

        values = normalize(values)
        values = values.transpose([1,0])
        values = values.reshape([1,6,3])
        print('Input:', values)
        
        result = model.predict(values)

        result = result.reshape([6,3])
        result = result.transpose([1,0])
        result = denormalize(result)
        result = result[:,::-1]
        result = result.tolist()
        print('Result:',result)
        
        result = { 'light': result[0],
                   'moisture': result[1],
                   'temperature': result[2]}
        json_string = json.dumps(result)
    except Exception as e:
        json_string = json.dumps({'result': str(e)})
    return json_string

@app.route("/", methods=['POST'])
def baseRoute():
    dataDict = request.get_json(force=True)
    responseJson = getPrediction(dataDict)
    return Response(responseJson, mimetype='application/json') 

if __name__ == "__main__":
    app.run()
