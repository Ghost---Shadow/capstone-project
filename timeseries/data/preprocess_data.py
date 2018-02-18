import numpy as np
import matplotlib.pyplot as plt

READINGS = 100
DATA_SIZE = 100

analog_gen = np.poly1d(np.polyfit([0,12,24],[700,300,200],2))
temperature_gen = np.poly1d(np.polyfit([0,12,24],[20,40,20],2))

light_values = [None for _ in range(DATA_SIZE)]
moisture_values = [None for _ in range(DATA_SIZE)]
temperature_values = [None for _ in range(DATA_SIZE)]

for i in range(DATA_SIZE):
    light_values[i] = np.array([analog_gen(i) for i in np.linspace(0,24,READINGS)])
    light_values[i] += np.random.rand(READINGS) * 2
    ##plt.plot(light_values[i])
    
    moisture_values[i] = np.array([analog_gen(i) for i in np.linspace(0,24,READINGS)])
    moisture_values[i] += np.random.rand(READINGS) * 2
    ##plt.plot(moisture_values[i])
    
    temperature_values[i] = [temperature_gen(i) for i in np.linspace(0,24,READINGS)]
    temperature_values[i] += np.random.rand(READINGS) * 2
    ##plt.plot(temperature_values)

light_values = np.array(light_values)
moisture_values = np.array(moisture_values)
temperature_values = np.array(temperature_values)

print(light_values.shape, moisture_values.shape, temperature_values.shape)

dataset = np.array([light_values, moisture_values, temperature_values])

print(dataset.shape)

np.save('./dataset.npy', dataset)

##plt.show()

