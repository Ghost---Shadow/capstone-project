import json
import numpy as np

with open('./data/moments.json') as f:
    moments = json.load(f)

def normalize(dataset):
    for i in range(len(moments)):
        dataset[i] -= moments[i]['mean']
        dataset[i] /= moments[i]['std']
    return dataset

def denormalize(dataset):
    for i in range(len(moments)):
        dataset[i] *= moments[i]['std']
        dataset[i] += moments[i]['mean']
    return dataset

print('Normalization error:',
      np.sum(denormalize(normalize(np.zeros([3,100,100])))))
