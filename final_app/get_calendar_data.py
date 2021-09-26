# import libaries
import pandas as pd


def get_data():

    df = pd.read_csv('regression_data_with_predictions.csv')
    df['time'] = pd.to_datetime(df['time'], unit='s')

    json = df.to_json(orient='records')
    
    #return data in json format
    return json