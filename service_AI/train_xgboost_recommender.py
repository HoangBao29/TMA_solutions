import argparse
import glob
import os

import numpy as np
import torch
from sklearn.metrics import average_precision_score, classification_report, roc_auc_score
from xgboost import XGBClassifier

from data import load_dataset
from settings import MOVIE_LENS_100k_DATASET_PATH
from xgboost_recommender import build_feature_matrix


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _latest_file(pattern: str):
    candidates = glob.glob(os.path.join(BASE_DIR, pattern))
    if not candidates:
        return None
    return max(candidates, key=os.path.getmtime)


def _load_embeddings():
    users_path = _latest_file("users_embeddings_attention_autoencoder_*.pt")
    movies_path = _latest_file("movies_embeddings_attention_autoencoder_*.pt")

    if not users_path or not movies_path:
        raise FileNotFoundError(
            "Missing attention-autoencoder embeddings. Run the user/movie training scripts first."
        )

    users_embeddings = torch.load(users_path, map_location="cpu").float()
    movies_embeddings = torch.load(movies_path, map_location="cpu").float()

    users_embeddings = users_embeddings / (users_embeddings.norm(dim=1, keepdim=True) + 1e-8)
    movies_embeddings = movies_embeddings / (movies_embeddings.norm(dim=1, keepdim=True) + 1e-8)

    return users_embeddings, movies_embeddings


def _build_xy(df, users_embeddings, movies_embeddings, movies_features, positive_threshold=4.0, limit=None):
    if limit is not None:
        df = df.sample(n=min(limit, len(df)), random_state=42)

    user_indices = df["user_id"].values
    movie_indices = df["movie_id"].values

    user_vectors = users_embeddings[user_indices]
    movie_vectors = movies_embeddings[movie_indices]
    movie_feature_vectors = movies_features[movie_indices]

    x = build_feature_matrix(user_vectors, movie_vectors, movie_feature_vectors)
    y = (df["rating"].values >= positive_threshold).astype(np.int32)
    return x, y


def main():
    parser = argparse.ArgumentParser(description="Train an XGBoost recommender for TKFilm")
    parser.add_argument("--output", default=os.path.join(BASE_DIR, "xgb_recommender.json"))
    parser.add_argument("--threshold", type=float, default=4.0)
    parser.add_argument("--train-limit", type=int, default=None)
    parser.add_argument("--val-limit", type=int, default=None)
    parser.add_argument("--n-estimators", type=int, default=160)
    parser.add_argument("--max-depth", type=int, default=6)
    parser.add_argument("--learning-rate", type=float, default=0.08)
    parser.add_argument("--subsample", type=float, default=0.85)
    parser.add_argument("--colsample-bytree", type=float, default=0.85)
    args = parser.parse_args()

    train_df, val_df, _, _, _, _, _, movies_features = load_dataset(
        MOVIE_LENS_100k_DATASET_PATH,
        split=1,
        val_size=0.15,
    )

    users_embeddings, movies_embeddings = _load_embeddings()
    movies_features = movies_features.to(torch.float32)

    x_train, y_train = _build_xy(
        train_df,
        users_embeddings,
        movies_embeddings,
        movies_features,
        positive_threshold=args.threshold,
        limit=args.train_limit,
    )
    x_val, y_val = _build_xy(
        val_df,
        users_embeddings,
        movies_embeddings,
        movies_features,
        positive_threshold=args.threshold,
        limit=args.val_limit,
    )

    pos_count = int(y_train.sum())
    neg_count = int(len(y_train) - pos_count)
    scale_pos_weight = neg_count / max(pos_count, 1)

    model = XGBClassifier(
        objective="binary:logistic",
        eval_metric="logloss",
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        learning_rate=args.learning_rate,
        subsample=args.subsample,
        colsample_bytree=args.colsample_bytree,
        reg_lambda=1.0,
        reg_alpha=0.0,
        min_child_weight=1,
        tree_method="hist",
        n_jobs=-1,
        random_state=42,
        scale_pos_weight=scale_pos_weight,
    )

    model.fit(
        x_train,
        y_train,
        eval_set=[(x_val, y_val)],
        verbose=False,
    )

    val_pred = model.predict_proba(x_val)[:, 1]
    val_auc = roc_auc_score(y_val, val_pred) if len(np.unique(y_val)) > 1 else float("nan")
    val_ap = average_precision_score(y_val, val_pred)
    val_pred_label = (val_pred >= 0.5).astype(np.int32)

    print("Validation AUC:", f"{val_auc:.4f}" if not np.isnan(val_auc) else "n/a")
    print("Validation AP:", f"{val_ap:.4f}")
    print(classification_report(y_val, val_pred_label, digits=4))

    model.save_model(args.output)
    print(f"Saved XGBoost recommender to {args.output}")


if __name__ == "__main__":
    main()