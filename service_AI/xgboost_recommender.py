import logging
import os
from typing import Optional

import numpy as np
import torch

try:
    from xgboost import XGBClassifier
except Exception:  # pragma: no cover - handled at runtime
    XGBClassifier = None

logger = logging.getLogger(__name__)


def _to_numpy(value):
    if torch.is_tensor(value):
        value = value.detach().cpu().numpy()
    return np.asarray(value, dtype=np.float32)


def _ensure_2d(value):
    array = _to_numpy(value)
    if array.ndim == 1:
        return array.reshape(1, -1)
    return array


def build_feature_matrix(user_vector, movie_vectors, movie_features=None):
    user_array = _ensure_2d(user_vector)
    movie_array = _ensure_2d(movie_vectors)

    if user_array.shape[0] == movie_array.shape[0] and user_array.shape[0] > 1:
        user_repeated = user_array
    elif user_array.shape[0] == 1:
        user_repeated = np.repeat(user_array, movie_array.shape[0], axis=0)
    else:
        raise ValueError("user_vector must either be a single vector or have the same number of rows as movie_vectors")

    features = [
        user_repeated,
        movie_array,
        user_repeated * movie_array,
        np.abs(user_repeated - movie_array),
    ]

    if movie_features is not None:
        movie_features_array = _ensure_2d(movie_features)
        if movie_features_array.shape[0] != movie_array.shape[0]:
            raise ValueError("movie_features must have the same number of rows as movie_vectors")
        features.append(movie_features_array)

    return np.concatenate(features, axis=1).astype(np.float32, copy=False)


class XGBoostRecommender:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.path.join(os.path.dirname(__file__), "xgb_recommender.json")
        self.model = None
        self.ready = False
        self._load()

    def _load(self):
        if XGBClassifier is None:
            logger.warning("xgboost is not installed; XGBoost recommender disabled")
            return

        if not self.model_path or not os.path.exists(self.model_path):
            logger.info("XGBoost model file not found: %s", self.model_path)
            return

        try:
            model = XGBClassifier()
            model.load_model(self.model_path)
            self.model = model
            self.ready = True
            logger.info("Loaded XGBoost recommender from %s", self.model_path)
        except Exception as exc:
            logger.warning("Failed to load XGBoost recommender: %s", exc)

    def score_movies(self, user_vector, movie_vectors, movie_features=None):
        if not self.ready:
            raise RuntimeError("XGBoost recommender is not ready")

        feature_matrix = build_feature_matrix(user_vector, movie_vectors, movie_features)
        probabilities = self.model.predict_proba(feature_matrix)
        if probabilities.ndim == 1:
            return probabilities.astype(np.float32, copy=False)
        return probabilities[:, 1].astype(np.float32, copy=False)
