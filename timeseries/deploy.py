'''
This module deploys the trained keras model
'''
import json

from flask import Flask
from flask import request

import numpy as np

from keras.models import load_model

LIGHT_MODEL_PATH = './light_model.h5'
TEMPERATURE_MODEL_PATH = './temperature_model.h5'

MOMENTS_PATH = './data/moments.json'

def loadModels():
    light_model = load_model(LIGHT_MODEL_PATH)
    temperature_model = load_model(TEMPERATURE_MODEL_PATH)

    return {
        'light':light_model,
        'temperature':temperature_model
    }

models = loadModels()

with open(MOMENTS_PATH) as f:
    MOMENTS = json.load(f)

app = Flask(__name__)

def normalize(model_name, arr):
    '''
    Normalizes array using population moments
    '''
    arr -= MOMENTS[model_name]['mean']
    arr /= MOMENTS[model_name]['std']
    return arr

def denormalize(model_name, arr):
    '''
    Denormalizes array using population moments
    '''
    arr *= MOMENTS[model_name]['std']
    arr += MOMENTS[model_name]['mean']
    return arr

def getPrediction(model_name, values):
    '''
    Uses the model to predict values and returns a JSON
    '''
    try:
        model = models[model_name]
        values = np.array(values, dtype=np.float32)
        values = normalize(model_name, values)
        print('Input:', values)
        values = values.reshape([1,9,1])
        result = model.predict(values).tolist()[0][0]
        result = denormalize(model_name, result)
        print('Result:',result)
        json_string = json.dumps({'result': result})
    except Exception as e:
        json_string = json.dumps({'result': str(e)})
    return json_string

@app.route("/light", methods=['POST'])
def lightRoute():
    dataDict = request.get_json(force=True)
    responseJson = getPrediction('light', np.array(dataDict['values']))
    return responseJson

@app.route("/temperature", methods=['POST'])
def temperatureRoute():
    dataDict = request.get_json(force=True)
    responseJson = getPrediction('temperature', np.array(dataDict['values']))
    return responseJson

if __name__ == "__main__":
    app.run()
