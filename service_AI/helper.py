#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Jan 24 17:10:44 2025

@author: shervin
"""

import torch 
import torch.nn as nn

mse_loss = nn.MSELoss()

def masked_rmse_loss(y, y_hat):
    mask = y != 0
    y = y[mask].reshape(-1, 1)
    y_hat = y_hat[mask].reshape(-1, 1)
    return torch.sqrt(mse_loss(y, y_hat))