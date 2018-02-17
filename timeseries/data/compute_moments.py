import json

import numpy as np

DATA_FILE_PATH = './dataset.npy'
OUTPUT_FILE_NAME = './moments.json'

dataset = np.load(DATA_FILE_PATH)

moments = []

for data in dataset:
  data_mean = float(data.mean())
  data_std = float(data.std())
  print('Moments:',data_mean, data_std)

  momentDict = {
      'mean':data_mean,
      'std':data_std
    }
  moments.append(momentDict)

with open(OUTPUT_FILE_NAME, 'w') as f:
  json.dump(moments,f)
