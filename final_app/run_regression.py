# import dependencies
import requests
import pandas as pd
import numpy as np
import json
from nltk.tokenize import RegexpTokenizer
from nltk.stem import PorterStemmer

from nltk.corpus import stopwords
stopwords = stopwords.words('english')

from joblib import load
classifier_model = load('headline_classifier.joblib')
vectorizer = load('tfid_vectorizer.joblib')
regression_model_7day = load('regression_7day.joblib')
regression_model_1day = load('regression_1day.joblib')

# import api key
from config import api_key

def run_model():

    #get current BTC price
    query_url = f'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key={api_key}'
    response = requests.get(query_url)       
    if response.status_code == 200:
        response_json = response.json()
    current_price = response_json['USD']

    # get recent blockchain data from api
    query_url = f'https://min-api.cryptocompare.com/data/blockchain/histo/day?fsym=BTC&limit=7&api_key={api_key}'
    response = requests.get(query_url)        
    if response.status_code == 200:
        response_json = response.json()
    data = response_json['Data']['Data']

    # put data in df
    df_chain = pd.DataFrame(data)

    # get market data from api
    query_url = f'https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=365&api_key={api_key}'
    response = requests.get(query_url)        
    if response.status_code == 200:
        response_json = response.json()
    data = response_json['Data']['Data']

    # put data in df
    df_market = pd.DataFrame(data)

    # create df of most recent market data
    df_market_recent = df_market.tail(7)

    # get recent social data from api
    query_url = f'https://min-api.cryptocompare.com/data/social/coin/histo/day?coinId=1182&limit=6&api_key={api_key}'
    response = requests.get(query_url)      
    if response.status_code == 200:
        response_json = response.json()
    data = response_json['Data']

    # put data in df
    df_social = pd.DataFrame(data)

    # get recent news data from api
    query_url = f'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC&api_key={api_key}'
    response = requests.get(query_url)
    if response.status_code == 200:
        response_json = response.json()
    data = response_json['Data']

    # grab headlines only
    headlines = [article['title'] for article in data]

    # preprocessing the headlines for sentiment classifier model
    tokenizer = RegexpTokenizer(r'\w+')
    token_list = []

    for sentence in headlines:

            tokens = tokenizer.tokenize(sentence)
            lower_list = []
            for token in tokens:
                result = ''.join(i for i in token if not i.isdigit())
                result = PorterStemmer().stem(result)
                if result.lower() == 'btc':
                    result = 'bitcoin'
                if len(result) > 1:
                    lower_list.append(result.lower())
                
            token_list.append(lower_list)

    sentences_processed = []
    for token in token_list:
        str1 = " "  
        sentences_processed.append(str1.join(token))

    # vectorize the headlines and make sentiment predictions using saved models
    X_vector = vectorizer.transform(sentences_processed)
    sentiment = classifier_model.predict(X_vector)

    # get the average sentiment (first subtract 1 to make negative=-1, neutral=0, postive=1)
    sentiment_avg = (sentiment - 1).mean()

    # save inputs for regression model
    model_input_list = [current_price
            ,df_market_recent['open'].iloc[0]
            ,df_market_recent['open'].iloc[6]
            ,df_chain['transaction_count'].mean() * df_chain['average_transaction_value'].mean()
            ,df_chain['large_transaction_count'].mean()
            ,df_social['reddit_comments_per_day'].mean()
            ,df_market_recent['volumeto'].mean()
            ,sentiment_avg
        ]

    model_input_array = np.asarray(model_input_list).reshape(1,-1)

    prediction_7day = regression_model_7day.predict(model_input_array)
    prediction_1day = regression_model_1day.predict(model_input_array)

    return_dict = {'current_price': current_price
                    ,'prediction_1day': prediction_1day[0]
                    ,'prediction_7day': prediction_7day[0]
                }

    return_json = json.dumps(return_dict)

    return return_json

