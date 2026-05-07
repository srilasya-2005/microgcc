import pandas as pd
import numpy as np
from prophet import Prophet
from xgboost import XGBRegressor
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_percentage_error
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler

class ModelHandler:
    def __init__(self):
        self.best_model = None
        self.best_model_name = ""
        self.best_mape = float('inf')

    def train_arima(self, train_data, test_data):
        try:
            # Simple SARIMA (1,1,1)(1,1,1,7) for weekly/daily seasonality
            model = SARIMAX(train_data['Total'], order=(1,1,1), seasonal_order=(1,1,1,7))
            model_fit = model.fit(disp=False)
            predictions = model_fit.forecast(steps=len(test_data))
            mape = mean_absolute_percentage_error(test_data['Total'], predictions)
            return model_fit, mape
        except Exception as e:
            print(f"ARIMA error: {e}")
            return None, float('inf')

    def train_prophet(self, train_data, test_data):
        try:
            df_prophet = train_data.rename(columns={'Date': 'ds', 'Total': 'y'})
            model = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
            model.fit(df_prophet)
            
            future = model.make_future_dataframe(periods=len(test_data), freq='W')
            forecast = model.predict(future)
            predictions = forecast.iloc[-len(test_data):]['yhat']
            
            mape = mean_absolute_percentage_error(test_data['Total'], predictions)
            return model, mape
        except Exception as e:
            print(f"Prophet error: {e}")
            return None, float('inf')

    def train_xgboost(self, train_df, test_df, feature_cols):
        try:
            X_train = train_df[feature_cols]
            y_train = train_df['Total']
            X_test = test_df[feature_cols]
            y_test = test_df['Total']
            
            model = XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=5)
            model.fit(X_train, y_train)
            
            predictions = model.predict(X_test)
            mape = mean_absolute_percentage_error(y_test, predictions)
            return model, mape
        except Exception as e:
            print(f"XGBoost error: {e}")
            return None, float('inf')

    def train_lstm(self, train_data, test_data, look_back=7):
        try:
            scaler = MinMaxScaler(feature_range=(0, 1))
            scaled_data = scaler.fit_transform(train_data[['Total']].values)
            
            def create_dataset(dataset, look_back=1):
                dataX, dataY = [], []
                for i in range(len(dataset)-look_back-1):
                    a = dataset[i:(i+look_back), 0]
                    dataX.append(a)
                    dataY.append(dataset[i + look_back, 0])
                return np.array(dataX), np.array(dataY)

            X_train, y_train = create_dataset(scaled_data, look_back)
            X_train = np.reshape(X_train, (X_train.shape[0], 1, X_train.shape[1]))

            model = Sequential([
                LSTM(50, input_shape=(1, look_back)),
                Dropout(0.2),
                Dense(1)
            ])
            model.compile(loss='mean_squared_error', optimizer='adam')
            model.fit(X_train, y_train, epochs=20, batch_size=1, verbose=0)

            # Prediction logic for LSTM (recursive)
            last_val = scaled_data[-look_back:]
            predictions = []
            curr_val = last_val.reshape(1, 1, look_back)
            
            for _ in range(len(test_data)):
                pred = model.predict(curr_val, verbose=0)
                predictions.append(pred[0,0])
                # Update window
                new_window = np.append(curr_val[0,0,1:], pred[0,0])
                curr_val = new_window.reshape(1, 1, look_back)
            
            final_predictions = scaler.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten()
            mape = mean_absolute_percentage_error(test_data['Total'], final_predictions)
            
            return (model, scaler, look_back), mape
        except Exception as e:
            print(f"LSTM error: {e}")
            return None, float('inf')

if __name__ == "__main__":
    # Quick Test Block
    print("--- Running Model Handler Quick Test ---")
    # Create dummy time series data
    dates = pd.date_range(start='2023-01-01', periods=50, freq='W')
    data = pd.DataFrame({
        'Date': dates,
        'Total': [100 + i + (10 if i % 4 == 0 else 0) for i in range(50)]
    })
    
    train = data.iloc[:40]
    test = data.iloc[40:]
    
    handler = ModelHandler()
    
    print("Testing ARIMA...")
    _, arima_mape = handler.train_arima(train, test)
    print(f"ARIMA MAPE: {arima_mape:.4f}")
    
    print("Testing Prophet...")
    _, prophet_mape = handler.train_prophet(train, test)
    print(f"Prophet MAPE: {prophet_mape:.4f}")
    
    print("Testing XGBoost...")
    # Add dummy features for XGB
    data_xgb = data.copy()
    data_xgb['lag_1'] = data_xgb['Total'].shift(1)
    data_xgb['rolling_mean_4'] = data_xgb['Total'].rolling(4).mean()
    data_xgb['day_of_week'] = data_xgb['Date'].dt.dayofweek
    data_xgb['month'] = data_xgb['Date'].dt.month
    data_xgb = data_xgb.dropna()
    
    train_xgb = data_xgb.iloc[:35]
    test_xgb = data_xgb.iloc[35:]
    feature_cols = ['lag_1', 'rolling_mean_4', 'day_of_week', 'month']
    _, xgb_mape = handler.train_xgboost(train_xgb, test_xgb, feature_cols)
    print(f"XGBoost MAPE: {xgb_mape:.4f}")
    
    print("Testing LSTM...")
    _, lstm_mape = handler.train_lstm(train, test)
    print(f"LSTM MAPE: {lstm_mape:.4f}")
    
    print("--- Test Complete ---")
