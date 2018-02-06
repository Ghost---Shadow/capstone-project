# Time series prediction

This module is used to predict the values of sensors.

# Requirements

1. Python 3.5 or similar
2. Tensorflow
3. Keras
4. h5py for saving models
5. Flask for serving

# Usage

1. Load your data as an array of shape `[SAMPLES, READINGS]`
2. Train the data using `train.py`
3. Deploy the trained model using `deploy.py`
4. The API expects a POST request at `/` with a JSON which has an numeric arraylike attribute with length 9. 
5. It then replies with the prediction.
