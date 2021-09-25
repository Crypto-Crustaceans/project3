**Crypto-Crustaceans Final Project**
# Financial Sentiment Analysis Dashboard

Presentation: https://docs.google.com/presentation/d/1gr_ywK173DjwX9ZGD-0iNdPRKY0OhHsTNKr5TaP-5_U/edit#slide=id.p

Published website: https://crypto-crustaceans.github.io/project3/


## Background

For this project, our goal is to analyze the effect of financial news headlines on the market and display the result in an easy to intpetret dashboard. We are incorporating market data from Yahoo Finance and archived financial news articles. A source on Kaggle has 4 million articles for 6,000 stocks from 2009-2020. A sentiment analysis will be performed on financial texts using a pre-trained model finBERT, which will tell us whether a headline is positive, neutral, or negative.

The sentiment analysis will be plotted against market movement data from Yahoo Finance into color-coded monthly calendars. We will have options to toggle between different time periods to review this over time. We also plotted this out over time using Chart.js library.
