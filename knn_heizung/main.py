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
        generate(argv[2])
    if argv[1] == 'train':
        train(argv[2])
    if argv[1] == 'run':
        run(argv[2])
    if len(argv) != 3 and argv[1] != 'gen':
        print('USAGE: main.py {gen,run} <training.csv>')

# Disable
def block_print():
    sys.stdout = open(os.devnull, 'w')

# Restore
def enable_print():
    sys.stdout = sys.__stdout__

# generate training data
def generate(temp):
    block_print()
    # TODO: Make station selection for weather data dynamic
    stat_url = 'https://api.open-meteo.com/v1/forecast?latitude=51.435146&longitude=6.762692&hourly=temperature_2m&timezone=Europe%2FBerlin&past_days=92&forecast_days=16'

    # prepare fetched data as dataframe
    print('request weather data for 108 days...')
    response = requests.get(stat_url)

    print('reading weather data...')
    df = pd.DataFrame()
    df['time'] = response.json()['hourly']['time']
    df['temp'] = response.json()['hourly']['temperature_2m']
    df.dropna(axis=0, inplace=True)
    ## Debug
    #print(df)

    # generate diff temperatures from user input
    # usertemp = input('Wunschtemperatur in °C:')
    usertemp = float(temp)

    print('generate deltas...')
    arr = []

    for i in df.index:
        arr.append(round(usertemp - df['temp'][i], 2))

    df['difftemp'] = arr

    ## Debug output
    #print(df)
    print('export to CSV...')
    df.to_csv('training.csv', sep=';', index=False, decimal=',')


def train(file: str):
    block_print()
    df = pd.read_csv(file, sep=';', decimal=',')
    # debug
    print(df.dtypes)

    # prepare data for machine learning algo
    feat_tmp = df.drop(columns=['time', 'difftemp'])
    cat_tmp = df.drop(columns=['time', 'temp'])

    x = feat_tmp.values
    y = cat_tmp.values

    # Split data into training-, validation-, and test-data
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.05)
    x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, 
                                                      test_size=0.2)
    
    # Model creation
    m = keras.Sequential()
    
    # 1st input layer with single neuron, 1st hidden layer with 4 neurons
    m.add(keras.layers.Dense(5, activation='relu', input_shape=(1,)))
    # Output layer of the model
    m.add(keras.layers.Dense(1, activation=None))

    m.summary()
    ## input("Press Enter to continue...")

    # compile model
    m.compile(optimizer='adam', loss='mse',
              metrics=[metrics.mean_absolute_error])

    # Model training
    m.fit(x_train, y_train, batch_size=50, epochs=200, 
          validation_data=(x_val, y_val))

    # Validate models accuracy
    #_, acc = 
    print(m.evaluate(x_test, y_test))

    # more transparent micro-tests
    more_tests = np.array([20, 19, 18, 17, 16])
    print(more_tests)
    print(m.predict(more_tests))

    m.save('model.keras')
    print('model exported to "model.keras"')

def run(outtemp: float):
    block_print()
    print('Loading Model...')
    m = keras.saving.load_model('model.keras')
    tmp = m.predict(np.array( [float(outtemp),] ))
    enable_print()
    print(float(tmp[0]))

if __name__ == '__main__':
    main()
