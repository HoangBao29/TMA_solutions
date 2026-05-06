#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import numpy as np
import pandas as pd
from data import load_movies_features, load_users_dataset
from settings import MOVIE_LENS_100k_DATASET_PATH
import matplotlib.pyplot as plt 

users_features = load_users_dataset(MOVIE_LENS_100k_DATASET_PATH)
movies_features = load_movies_features(MOVIE_LENS_100k_DATASET_PATH)

plt.figure(figsize=(8,8))
plt.rcParams.update({'font.size':15})
users_features['age'].hist(bins=50)
plt.show()

plt.figure(figsize=(5,4))
users_features['gender'].value_counts().plot.bar()
plt.show()

plt.figure(figsize=(7,6))
plt.rcParams.update({'font.size':15})
users_features['occupation'].value_counts().plot.bar()
plt.show()

plt.figure(figsize=(7,5))
plt.rcParams.update({'font.size':15})
movies_features['release date'].hist(bins=50)
plt.show()

plt.figure(figsize=(8,5))
plt.rcParams.update({'font.size':15})
movies_features.iloc[:,3:].sum().plot.bar()
plt.show()
