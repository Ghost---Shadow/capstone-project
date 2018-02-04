'''
This module deploys the trained keras model
'''
import json

from flask import Flask
from flask import request

import numpy as np

from keras.models import load_model
model = load_model('./my_model.h5')

# Calculate data moments
data = np.load('./data/light_values.npy')
data_mean = float(data.mean())
data_std = float(data.std())
print('Moments:',data_mean, data_std)

app = Flask(__name__)

def normalize(arr):
    '''
    Normalizes array using population moments
    '''
    arr -= data_mean
    arr /= data_std
    return arr

def denormalize(arr):
    '''
    Denormalizes array using population moments
    '''
    arr *= data_std
    arr += data_mean
    return arr

def getPrediction(values):
    '''
    Uses the model to predict values and returns a JSON
    '''
    try:
        values = np.array(values, dtype=np.float32)
        values = normalize(values)
        print('Input:', values)
        values = values.reshape([1,9,1])
        result = model.predict(values).tolist()[0][0]
        result = denormalize(result)
        print('Result:',result)
        json_string = json.dumps({'result': result})
    except Exception as e:
        json_string = json.dumps({'result': str(e)})
    return json_string

@app.route("/", methods=['POST'])
def hello():
    dataDict = request.get_json(force=True)
    responseJson = getPrediction(np.array(dataDict['values']))
    return responseJson

if __name__ == "__main__":
    app.run()
