import glob
import math
import os
import numpy as np
import torch
from sklearn.metrics import roc_auc_score, average_precision_score

from data import load_dataset
from settings import MOVIE_LENS_100k_DATASET_PATH
from xgboost_recommender import XGBoostRecommender


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
XGB_MODEL_FILENAME = "xgb_recommender.json"


def _latest_file(pattern):
    files = glob.glob(os.path.join(BASE_DIR, pattern))
    return max(files, key=os.path.getmtime) if files else None


def ndcg_at_k(relevant, ranked, k):
    ranked = ranked[:k]
    rel = [1.0 if x in relevant else 0.0 for x in ranked]

    ideal = sorted(rel, reverse=True)
    dcg = lambda r: sum((2**x - 1) / math.log2(i + 2) for i, x in enumerate(r))

    idcg = dcg(ideal)
    return 0.0 if idcg == 0 else dcg(rel) / idcg


def rmse(y_true, y_pred):
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    return np.sqrt(np.mean((y_true - y_pred) ** 2))


def load_model_data():
    train_df, val_df, test_df, train_matrix, val_matrix, test_matrix, users_feat, movies_feat = load_dataset(
        MOVIE_LENS_100k_DATASET_PATH,
        split=1,
        val_size=0.15,
    )

    users_emb = torch.load(_latest_file("users_embeddings_attention_autoencoder_*.pt"), map_location="cpu").float()
    movies_emb = torch.load(_latest_file("movies_embeddings_attention_autoencoder_*.pt"), map_location="cpu").float()

    users_emb = users_emb / (users_emb.norm(dim=1, keepdim=True) + 1e-8)
    movies_emb = movies_emb / (movies_emb.norm(dim=1, keepdim=True) + 1e-8)

    model = XGBoostRecommender(os.path.join(BASE_DIR, XGB_MODEL_FILENAME))

    return train_matrix.float(), test_matrix.float(), users_emb, movies_emb, movies_feat, model


def evaluate():
    train_matrix, test_matrix, users_emb, movies_emb, movies_features, model = load_model_data()

    K_LIST = [5, 10, 20]
    threshold = 4.0

    rmses = []
    aucs = []
    aps = []

    precisions = {k: [] for k in K_LIST}
    recalls = {k: [] for k in K_LIST}
    ndcgs = {k: [] for k in K_LIST}

    print("\nEvaluating model...\n")

    for u in range(train_matrix.size(0)):

        train_items = (train_matrix[u] > 0).nonzero().view(-1).tolist()
        test_ratings = test_matrix[u]

        relevant_items = (test_ratings >= threshold).nonzero().view(-1).tolist()
        if len(relevant_items) == 0:
            continue

        scores = model.score_movies(
            users_emb[u],
            movies_emb,
            movies_features
        )
        scores = np.asarray(scores, dtype=np.float32)

        # ================= RMSE =================
        y_true = (test_ratings.numpy() >= threshold).astype(float)
        y_pred = scores

        rmses.append(rmse(y_true, y_pred))

        # ================= AUC / AP =================
        if len(np.unique(y_true)) > 1:
            aucs.append(roc_auc_score(y_true, y_pred))
            aps.append(average_precision_score(y_true, y_pred))

        # ================= Ranking =================
        scores[train_items] = -1e9
        ranked = np.argsort(-scores)

        for k in K_LIST:
            topk = ranked[:k]
            hits = len(set(topk) & set(relevant_items))

            precisions[k].append(hits / k)
            recalls[k].append(hits / len(relevant_items))
            ndcgs[k].append(ndcg_at_k(relevant_items, topk, k))

    # ================= PRINT =================
    print("\n================ RESULTS ================")

    print(f"RMSE (binary proxy): {np.mean(rmses):.4f}")  # <-- CHỖ BẠN CẦN

    print(f"AUC: {np.mean(aucs):.4f}" if aucs else "AUC: n/a")
    print(f"AP : {np.mean(aps):.4f}" if aps else "AP: n/a")

    print("\nRanking Metrics:")
    for k in K_LIST:
        print(
            f"Top-{k} | "
            f"P={np.mean(precisions[k]):.4f} | "
            f"R={np.mean(recalls[k]):.4f} | "
            f"NDCG={np.mean(ndcgs[k]):.4f}"
        )

    print("=========================================")


if __name__ == "__main__":
    evaluate()