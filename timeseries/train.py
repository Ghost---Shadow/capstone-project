from keras.layers import Input, LSTM, RepeatVector
from keras.models import Model
import numpy as np
import matplotlib.pyplot as plt

from utils import normalize

TIME_STEPS = 6
INPUT_DIM = 3
LATENT_DIM = 250
EPOCHS = 10
BATCH_SIZE = 100
MODEL_NAME = './model.h5'

# Load the dataset
dataset = np.load('./data/dataset.npy')

# Normalize the dataset
dataset = normalize(dataset)

# [type, batch, sequence] to [batch, sequence, type]
dataset = np.transpose(dataset,[1, 2, 0])

# Window the data
windowed_data = []
for observation in dataset:
    for index in range(len(observation) - TIME_STEPS * 2):
        windowed_data.append(observation[index: index + TIME_STEPS * 2])
windowed_data = np.array(windowed_data)

# Free up memory
del dataset

# Partition data into train and test
test_samples = 1000
np.random.shuffle(windowed_data)

x_train = windowed_data[test_samples:, :-TIME_STEPS]
x_test = windowed_data[:test_samples, :-TIME_STEPS]

y_train = windowed_data[test_samples:, -TIME_STEPS:]
y_test = windowed_data[:test_samples, -TIME_STEPS:]

print('Train shape:', x_train.shape, y_train.shape)
print('Test shape:', x_test.shape, y_test.shape)

inputs = Input(shape=(TIME_STEPS, INPUT_DIM))
encoded = LSTM(LATENT_DIM)(inputs)
decoded = RepeatVector(TIME_STEPS)(encoded)
decoded = LSTM(INPUT_DIM, return_sequences=True)(decoded)
sequence_autoencoder = Model(inputs, decoded)

sequence_autoencoder.compile(loss='mse', optimizer='adam')

sequence_autoencoder.summary()

sequence_autoencoder.fit(x_train,
          y_train,
          batch_size=BATCH_SIZE,
          epochs=EPOCHS,
          validation_split=0.05)

# Save the model
sequence_autoencoder.save(MODEL_NAME) 

# Predict on test set
predicted = sequence_autoencoder.predict(x_test)

# Calculate MSE, predicted vs actual
test_error = np.sum(np.square(predicted - y_test).mean())
print('MSE test: ', test_error)

def plotAll():
    try:
        plt.close('all')
        
        plt.figure(1)
        plt.plot(y_test[:100, 1, 0])
        plt.plot(predicted[:100, 1, 0])

        plt.figure(2)
        plt.plot(y_test[:100, 5, 1])
        plt.plot(predicted[:100, 5, 1])

        plt.figure(3)
        plt.plot(y_test[:100, 1, 2])
        plt.plot(predicted[:100, 1, 2])
        
        plt.show()
    except Exception as e:
        print (str(e))

plotAll()
