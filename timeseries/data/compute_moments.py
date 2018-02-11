import json

import numpy as np

PATH_FORMAT = './%s_values.npy'
OUTPUT_FILE_NAME = './moments.json'

datasets = [
  'light',
  'temperature',
]

momentDict = {
  'light': {},
  'temperature' : {}
}

for dataset in datasets:
  data = np.load(PATH_FORMAT % dataset)
  data_mean = float(data.mean())
  data_std = float(data.std())
  print('Moments:',data_mean, data_std)

  momentDict[dataset]['mean'] = data_mean
  momentDict[dataset]['std'] = data_std

with open(OUTPUT_FILE_NAME, 'w') as f:
  json.dump(momentDict,f)
