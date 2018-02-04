import numpy as np
import matplotlib.pyplot as plt

READINGS = 100
DATA_SIZE = 100

analog_gen = np.poly1d(np.polyfit([0,12,24],[700,300,200],2))
temperature_gen = np.poly1d(np.polyfit([0,12,24],[20,40,20],2))

light_values = [None for _ in range(DATA_SIZE)]
temperature_values = [None for _ in range(DATA_SIZE)]

for i in range(DATA_SIZE):
    light_values[i] = np.array([analog_gen(i) for i in np.linspace(0,24,READINGS)])
    light_values[i] += np.random.rand(READINGS) * 25
    ##plt.plot(light_values[i])
    
    temperature_values[i] = [temperature_gen(i) for i in np.linspace(0,24,READINGS)]
    temperature_values[i] += np.random.rand(READINGS) * 2
    ##plt.plot(temperature_values)

light_values = np.array(light_values)
temperature_values = np.array(temperature_values)

print(light_values.shape, temperature_values.shape)

np.save('./light_values.npy', light_values)
np.save('./temperature_values.npy', temperature_values)

##plt.show()

