#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
from torch.utils.data import Dataset, DataLoader
import os
from sklearn.preprocessing import OneHotEncoder
from settings import MOVIE_LENS_100k_DATASET_PATH
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split


def load_dataset(dataset_path, split=1, val_size=0.1):
    stats = load_stats(dataset_path)
    
    users_df = load_users_dataset(dataset_path)
    users_features = vectorize_users_dataset(users_df, dataset_path)
    
    movies_df = load_movies_features(dataset_path)
    movies_features = vectorize_movie_dataset(movies_df)
    
    train_df = pd.read_table(os.path.join(dataset_path, f'u{split}.base'), header=None, names=\
                                  ['user_id','movie_id','rating','timestamp']).drop('timestamp',axis=1)
    train_df['user_id'] -= 1
    train_df['movie_id'] -= 1
    
    test_df = pd.read_table(os.path.join(dataset_path, f'u{split}.test'), header=None, names=\
                                  ['user_id','movie_id','rating','timestamp']).drop('timestamp',axis=1)
    
    test_df['user_id'] -= 1
    test_df['movie_id'] -= 1
        
    train_df, val_df = train_test_split(train_df, test_size=val_size, shuffle=True)
    
    train_rating_matrix = np.zeros((stats['users'], stats['items']))
    
    train_rating_matrix[train_df['user_id'].values, train_df['movie_id'].values] = train_df['rating'].values
    
    val_rating_matrix = np.zeros((stats['users'], stats['items']))
    val_rating_matrix[val_df['user_id'].values, val_df['movie_id'].values] = val_df['rating'].values
    
    test_rating_matrix = np.zeros((stats['users'], stats['items']))
    test_rating_matrix[test_df['user_id'].values, test_df['movie_id'].values] = test_df['rating'].values
    
    train_rating_matrix, val_rating_matrix, test_rating_matrix = torch.from_numpy(train_rating_matrix), torch.from_numpy(val_rating_matrix), torch.from_numpy(test_rating_matrix)
    return train_df, val_df, test_df, train_rating_matrix, val_rating_matrix, test_rating_matrix, users_features, movies_features


def load_stats(dataset_path):
    stats = {}
    with open(os.path.join(dataset_path, 'u.info')) as file:
        for  line in file.readlines():
            count, key = line.replace('\n','').split(' ')
            count = int(count)
            stats[key] = count
    return stats


def load_movies_features(dataset_path):
    movies_dataset = pd.read_table(os.path.join(dataset_path, 'u.item'), header=None, sep='|',encoding='latin-1',names=[\
       'movie_id','movie title','release date','video release date',
               'IMDb URL' , 'unknown' , 'Action' , 'Adventure' , 'Animation' ,
               'Children\'s' , 'Comedy' , 'Crime' , 'Documentary' , 'Drama' , 'Fantasy' ,
               'Film-Noir', 'Horror' , 'Musical', 'Mystery' , 'Romance' , 'Sci-Fi' ,
               'Thriller' , 'War' , 'Western']).set_index('movie_id').drop('video release date',axis=1)
    
    movies_dataset['release date'] = movies_dataset['release date'].fillna(movies_dataset['release date'].mode()[0])
    
    movies_dataset['release date'] = movies_dataset['release date'].apply(lambda x: int(x.split('-')[-1]))

    return movies_dataset



def vectorize_movie_dataset(movies_dataset):
    year_categories = [1920, 1940, 1960, 1980, 2000]
    date_categorical = pd.cut(movies_dataset['release date'], bins=year_categories, labels=list(range(0,len(year_categories)-1))).to_numpy()
    date_categorical = torch.from_numpy(date_categorical)
    movies_year_tensor = nn.functional.one_hot(date_categorical)
    movies_categories_tensor = torch.from_numpy(movies_dataset.iloc[:, 3:].values)
    
    dataset_tensor = torch.concat((movies_year_tensor, movies_categories_tensor), dim=1)
    
    
    return dataset_tensor

def load_users_dataset(dataset_path):
    users_dataset = pd.read_table(os.path.join(dataset_path, 'u.user'),header=None,sep='|', names = [\
            'user_id', 'age', 'gender','occupation','zip_code']).set_index('user_id').drop('zip_code',axis=1)
    return users_dataset

users_dataset = load_users_dataset(MOVIE_LENS_100k_DATASET_PATH)

def vectorize_users_dataset(users_dataset, dataset_path):
    age_categories = [0,12,18,30,50,90]
    age_categorical = pd.cut(users_dataset['age'], bins=age_categories, labels=list(range(0,len(age_categories)-1))).to_numpy()
    age_categorical = torch.from_numpy(age_categorical)
    age_categorical = nn.functional.one_hot(age_categorical)
    
    gender_categorical = users_dataset['gender'].apply(lambda x: 0 if x=='M' else 1).to_numpy()
    gender_categorical = torch.from_numpy(gender_categorical).reshape(-1,1)
    
    occupations = []
    with open(os.path.join(dataset_path, 'u.occupation')) as file:
        for line in file.readlines():
            occupations.append(line.replace('\n',''))
    
    occupation_categorical = users_dataset['occupation'].apply(lambda x: occupations.index(x)).to_numpy()
    occupation_categorical = torch.from_numpy(occupation_categorical)
    occupation_categorical = nn.functional.one_hot(occupation_categorical)
    
    users_features_tensor = torch.concat((gender_categorical, age_categorical, occupation_categorical), dim=1)
    return users_features_tensor



