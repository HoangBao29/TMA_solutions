
import os
import torch
import numpy as np
from data import load_dataset
from settings import MOVIE_LENS_100k_DATASET_PATH
import glob

def _latest_file(pattern: str):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = glob.glob(os.path.join(base_dir, pattern))
    if not candidates:
        return None
    return max(candidates, key=os.path.getmtime)

def load_model_data():
    print("Loading dataset...")
    train_df, val_df, test_df, train_rating_matrix, val_rating_matrix, test_rating_matrix, users_features, movies_features = load_dataset(
        MOVIE_LENS_100k_DATASET_PATH,
        split=1,
        val_size=0.15
    )
    
    # Load embeddings
    movies_emb_path = _latest_file("movies_embeddings_attention_autoencoder_*.pt")
    if not movies_emb_path:
        raise FileNotFoundError("Movie embeddings not found")
        
    print(f"Loading movie embeddings from {movies_emb_path}")
    movies_emb = torch.load(movies_emb_path, map_location="cpu").float()
    
    # Normalize like app.py
    movies_emb = movies_emb / (movies_emb.norm(dim=1, keepdim=True) + 1e-8)
    
    return {
        'train_matrix': train_rating_matrix.float(),
        'test_matrix': test_rating_matrix.float(),
        'movies_emb': movies_emb
    }

def evaluate():
    data = load_model_data()
    train_matrix = data['train_matrix']
    test_matrix = data['test_matrix']
    movies_emb = data['movies_emb']
    
    num_users = train_matrix.size(0)
    
    print(f"\nEvaluating on {num_users} users...")
    
    rmses = []
    
    # Ranking metrics
    k_list = [10, 20]
    precisions = {k: [] for k in k_list}
    recalls = {k: [] for k in k_list}
    
    for u in range(num_users):
        # 1. Construct User Profile from TRAIN ratings (mimic app.py)
        user_ratings = train_matrix[u]
        rated_indices = (user_ratings > 0).nonzero().view(-1)
        
        if len(rated_indices) == 0:
            continue
            
        rated_embs = movies_emb[rated_indices]
        ratings = user_ratings[rated_indices]
        
        # Weighted average
        weights = ratings.unsqueeze(1)
        user_profile = (rated_embs * weights).sum(dim=0) / weights.sum()
        user_profile = user_profile / (user_profile.norm() + 1e-8)
        
        # 2. Predict scores for ALL movies
        scores = torch.mv(movies_emb, user_profile)
        
        # 3. Evaluate on TEST ratings
        test_ratings = test_matrix[u]
        test_indices = (test_ratings > 0).nonzero().view(-1)
        
        if len(test_indices) == 0:
            continue
            
        # -- RMSE Calculation --
        # Note: scores are cosine similarities [-1, 1] roughly, ratings are [1, 5]
        # This will be huge unless we scale.
        # But let's report the raw difference to show the disconnect.
        pred_vals = scores[test_indices]
        actual_vals = test_ratings[test_indices]
        mse = torch.mean((pred_vals - actual_vals) ** 2).item()
        rmses.append(np.sqrt(mse))
        
        # -- Ranking Metrics --
        # Mask training items so they aren't recommended
        scores[rated_indices] = float('-inf')
        
        # Ground truth: items in test set with rating >= 4.0
        relevant_items = (test_ratings >= 4.0).nonzero().view(-1).tolist()
        if not relevant_items:
            continue
            
        for k in k_list:
            # Get top K recommendations
            _, top_indices = torch.topk(scores, k=k)
            top_indices = top_indices.tolist()
            
            # Intersection
            hits = len(set(top_indices) & set(relevant_items))
            
            p_k = hits / k
            r_k = hits / len(relevant_items)
            
            precisions[k].append(p_k)
            recalls[k].append(r_k)
            
    # Aggregate
    avg_rmse = np.mean(rmses)
    
    print("\n" + "="*40)
    print("EVALUATION RESULTS")
    print("="*40)
    print(f"RMSE (Raw Score vs Rating): {avg_rmse:.4f}")
    print("(Note: High RMSE is expected as Dot Product scores are not in 1-5 scale)")
    
    print("\nRanking Metrics (Ground Truth: Test items with Rating >= 4.0)")
    for k in k_list:
        avg_p = np.mean(precisions[k])
        avg_r = np.mean(recalls[k])
        print(f"Top-{k}: Precision={avg_p:.4f}, Recall={avg_r:.4f}")
    print("="*40)

if __name__ == "__main__":
    evaluate()
