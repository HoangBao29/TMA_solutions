import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import torch
from data import load_dataset
from settings import MOVIE_LENS_100k_DATASET_PATH
from sklearn.metrics import root_mean_squared_error
from xgboost import XGBRegressor
from tqdm import tqdm
from sklearn.model_selection import ParameterGrid
import dill
import gc

users_embeddings_file = 'users_embeddings_attention_autoencoder_64_0.5.pt'
movies_embeddings_file = 'movies_embeddings_attention_autoencoder_64_0.5.pt'

users_embeddings = torch.load(users_embeddings_file).cpu().numpy()
movies_embeddings = torch.load(movies_embeddings_file).cpu().numpy()

train_df, val_df, test_df, train_rating_matrix, val_rating_matrix, test_rating_matrix, users_features, movies_features = load_dataset(MOVIE_LENS_100k_DATASET_PATH, split=1, val_size=0.15)

def construct_dataset(df):
    u_embed = users_embeddings[df['user_id'].values, :]
    u_features = users_features[df['user_id'].values,:].numpy()


    m_embed = movies_embeddings[df['movie_id'].values, :]
    m_features = movies_features[df['movie_id'].values,:].numpy()


    x = np.concatenate((u_embed,u_features, m_embed, m_features), axis=1)
    y = df['rating']
    return x,y

x_train, y_train = construct_dataset(train_df)
x_test, y_test = construct_dataset(val_df)


#XGBoost
# Define the parameter grid for XGBoost
param_grid = {
    'n_estimators': [1300,1500, 1700,1900],          # Number of trees
    'max_depth': [9],                  # Maximum depth of trees
    'learning_rate': [0.01],       # Learning rate (eta)
    'subsample': [1],                 # Fraction of data to sample for each tree
    'colsample_bytree': [0.2],          # Fraction of features to sample for each tree
    'reg_lambda': [1],                   # L2 regularization
    'reg_alpha': [ 3],                     # L1 regularization
}

# Initialize variables to track the best model and parameters
best_rmse = float('inf')
best_params: dict = {} 
best_model = None

# Generate combinations of parameters
param_list = list(ParameterGrid(param_grid))
progress_bar = tqdm(total=len(param_list))  # Initialize the progress bar

for params in param_list:
    progress_bar.update(1)  # Update the bar on each iteration
    
    # Train the XGBoost model with the current parameters
    xgb = XGBRegressor(
        objective='reg:squarederror',  # Regression objective
        random_state=42,
        **params
    )
    xgb.fit(x_train, y_train)
    
    # Predict and calculate RMSE
    y_pred = xgb.predict(x_test)
    rmse = root_mean_squared_error(y_test, y_pred)
    
    # Update the best model if current RMSE is better
    if rmse < best_rmse:
        best_rmse = rmse
        best_params = params
        best_model = xgb  # Save the best model so far
    
        # Save the model to a file
        #with open('best_xgboost_dim64_v1.dill', 'wb') as file:
        #    dill.dump(best_model, file)
    print("\n")
    print('n_estimators:', params['n_estimators'],"\n",
'max_depth:', params['max_depth'], "\n",                  # Maximum depth of trees
'learning_rate:', params['learning_rate'], "\n",      # Learning rate (eta)
'subsample:', params['subsample'], "\n",                 # Fraction of data to sample for each tree
'colsample_bytree:', params['colsample_bytree'], "\n",         # Fraction of features to sample for each tree
'reg_lambda:', params['reg_lambda'], "\n",                  # L2 regularization
'reg_alpha:', params['reg_alpha']                    # L1 regularization
    )
    print(f"\n Last RMSE: {rmse:.4f}") 
    print(f"\n Best RMSE: {best_rmse:.4f}\n")
        
    del xgb, y_pred
    gc.collect()    # Force garbage collection
    
progress_bar.close()
# Print final best parameters and RMSE
print("Parameters:","\n" ,
'n_estimators:', best_params['n_estimators'],"\n",
'max_depth:', best_params['max_depth'], "\n",                  # Maximum depth of trees
'learning_rate:', best_params['learning_rate'], "\n",      # Learning rate (eta)
'subsample:', best_params['subsample'], "\n",                 # Fraction of data to sample for each tree
'colsample_bytree:', best_params['colsample_bytree'], "\n",         # Fraction of features to sample for each tree
'reg_lambda:', best_params['reg_lambda'], "\n",                  # L2 regularization
'reg_alpha:', best_params['reg_alpha']                    # L1 regularization
)
print("\nRMSE:", best_rmse)