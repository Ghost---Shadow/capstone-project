'''
Trains the model and saves it
'''
import time

import matplotlib.pyplot as plt
import numpy as np

from keras.models import Sequential
from keras.layers.core import Dense, Activation, Dropout
from keras.layers.recurrent import LSTM
np.random.seed(1234)

DATASET = './data/temperature_values.npy'
MODEL_NAME = './temperature_model.h5'

# Load the dataset
data = np.load(DATASET)

# Calculate data moments
data_mean = data.mean()
data_std = data.std()

# Normalize the data
data -= data_mean
data /= data_std

# Window the data
windowed_data = []
sequence_length = 10
for observation in data:
    for index in range(len(observation) - sequence_length):
        windowed_data.append(observation[index: index + sequence_length])
windowed_data = np.array(windowed_data)

# Free up memory
del data

# Partition data into train and test
test_samples = 1000
np.random.shuffle(windowed_data)

x_train = np.expand_dims(windowed_data[test_samples:, :-1],2)
x_test = np.expand_dims(windowed_data[:test_samples, :-1],2)

y_train = windowed_data[test_samples:, -1]
y_train = y_train.reshape([len(windowed_data) - test_samples,1])
y_test = windowed_data[:test_samples, -1]
y_test = y_test.reshape([test_samples,1])

# Build model
model = Sequential()
layers = [1, 50, 100, 1]
model.add(LSTM(
        layers[1],
        input_shape=(None, 1),
        return_sequences=True))
#model.add(Dropout(0.2))

model.add(LSTM(
        layers[2],
        return_sequences=False))
#model.add(Dropout(0.2))

model.add(Dense(
        layers[3]))
model.add(Activation("linear"))

# Compile the model
start = time.time()
model.compile(loss="mse", optimizer="rmsprop")
print("Compilation Time : ", time.time() - start)

# Train the compiled model
epochs = 1
model.fit(x_train,
          y_train,
          batch_size=64,
          epochs=epochs,
          validation_split=0.05)

# Save the model
model.save(MODEL_NAME) 

# Predict on test set
predicted = model.predict(x_test)

# Calculate MSE, predicted vs actual
test_error = np.square(predicted - y_test).mean()
print('MSE test: ', test_error)

try:
    fig = plt.figure()
    ax = fig.add_subplot(111)
    ax.plot(y_test[:100, 0])
    plt.plot(predicted[:100, 0])
    plt.show()
except Exception as e:
    print (str(e))
