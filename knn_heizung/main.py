import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
import sys, os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # or any {'0', '1', '2'}
from tensorflow import keras
from keras import metrics

from sys import argv
import requests
import json

def main():
    if argv[1] == 'gen':
        generate()
    if argv[1] == 'train':
        train()
    if argv[1] == 'run':
        run(argv[2], argv[3], argv[4])

# Disable
def block_print():
    sys.stdout = open(os.devnull, 'w')

# Restore
def enable_print():
    sys.stdout = sys.__stdout__

# generate training data
def generate():
    block_print()
    os.system("./../datagen/ai-datagen")


def train():
    #block_print()
    df = pd.read_csv("data.csv", sep=';', decimal='.')

    # prepare data for machine learning algo
    feat_tmp = df.drop(columns=['boiler'])
    cat_tmp = df.drop(columns=['target', 'inside', 'outside'])

    x = feat_tmp.values
    y = cat_tmp.values

    # Split data into training-, validation-, and test-data
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.05)
    x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, 
                                                      test_size=0.2)
    
    #Check if model already exists
    if os.path.exists("model.keras"):
        m = keras.models.load_model("model.keras")
    else:
        # Model creation
        m = keras.Sequential()
        # 1st input layer with single neuron, 1st hidden layer with ? neurons
        m.add(keras.layers.Dense(5, activation='relu', input_shape=(3,)))
        # Output layer of the model
        m.add(keras.layers.Dense(1, activation=None))

    m.summary()

    # compile model
    m.compile(optimizer='adam', loss='mse',
              metrics=[metrics.mean_absolute_error])

    # Model training
    m.fit(x_train, y_train, batch_size=100, epochs=50, 
          validation_data=(x_val, y_val))

    # Validate models accuracy
    #_, acc = 
    print(m.evaluate(x_test, y_test))

    m.save('model.keras')
    print('model exported to "model.keras"')


def run(target: int, inside: int, outside: int):
    #block_print()
    print('Loading Model...')
    m = keras.saving.load_model('model.keras')
    tmp = m.predict(np.array([[[float(target)], [float(inside)], [float(outside)]]]))
    #enable_print()
    print(float(tmp[0]))

if __name__ == '__main__':
    main()
