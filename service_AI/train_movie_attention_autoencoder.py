from data import load_dataset
from settings import MOVIE_LENS_100k_DATASET_PATH
from models import AttentionAutoEncoder
import torch
from helper import masked_rmse_loss

import copy
import matplotlib.pyplot as plt

# setting parameters
ED = 64 
DO = 0.5
device = 'cuda' if torch.cuda.is_available() else 'cpu'
epochs = 1000
patience = 50
min_delta = 0.001

# loading data
train_df,\
val_df,\
test_df,\
train_rating_matrix,\
val_rating_matrix,\
test_rating_matrix,\
users_features,\
movies_features = load_dataset(MOVIE_LENS_100k_DATASET_PATH,
                               split=1,
                               val_size=0.15)

train_rating_matrix = train_rating_matrix.to(torch.float32).to(device)
val_rating_matrix = val_rating_matrix.to(torch.float32).to(device)

# training attention autoencoder
model = AttentionAutoEncoder(users_features.size(0), embedding_dim=ED, dropout=DO, users_features=movies_features.to(torch.float32).to(device)).to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=15)

history: dict = {
    'train_loss':[],
    'val_loss': []
    }
best_val_loss = float('inf')
best_epoch = 0
no_improve_epochs = 0

for epoch in range(epochs):
    model.train()
    running_loss = 0.0

    optimizer.zero_grad()
    x_pred = model(train_rating_matrix.T)
    loss = masked_rmse_loss(train_rating_matrix.T, x_pred)
    loss.backward()
    optimizer.step()
    running_loss = loss.item()

    model.eval()
    with torch.no_grad():
        x_pred = model(train_rating_matrix.T + val_rating_matrix.T)
        val_running_loss = masked_rmse_loss(val_rating_matrix.T, x_pred).item()

    scheduler.step(val_running_loss)

    if val_running_loss < best_val_loss - min_delta:
        best_val_loss = val_running_loss
        best_epoch = epoch + 1
        best_weights = copy.deepcopy(model.state_dict())
        no_improve_epochs = 0
        print(f'best weights updated at epoch {best_epoch}')
    else:
        no_improve_epochs += 1

    history['train_loss'].append(running_loss)
    history['val_loss'].append(val_running_loss)

    print(f'[{epoch+1}/{epochs}] loss:{running_loss:.4f}, val_loss: {val_running_loss:.4f}, best_loss: {best_val_loss:.4f}')

    if no_improve_epochs >= patience:
        print(f'Early stopping triggered at epoch {epoch+1}')
        break


if 'best_weights' in locals():
    model.load_state_dict(best_weights)
    print(f'Loaded best weights from epoch {best_epoch}')

# extracting movies embeddings
train_rating_matrix = train_rating_matrix + val_rating_matrix

with torch.no_grad():
    movies_embeddings = model.encode_with_attention(train_rating_matrix.T)

torch.save(movies_embeddings.cpu(), f"movies_embeddings_attention_autoencoder_{ED}_{DO}.pt")

# Plot train and validation loss
plt.plot(list(range(len(history['train_loss']))), history['train_loss'], label='Train Loss')
plt.plot(list(range(len(history['val_loss']))), history['val_loss'], label='Validation Loss')

# Highlight a specific point (e.g., the minimum validation loss)
min_val_loss_idx = history['val_loss'].index(min(history['val_loss']))
plt.scatter(min_val_loss_idx, history['val_loss'][min_val_loss_idx], color='red', label='Best Validation Loss')

# Annotate the specific point
plt.annotate(
    f"Epoch: {min_val_loss_idx}, RMSE Loss: {history['val_loss'][min_val_loss_idx]:.3f}",
    (min_val_loss_idx, history['val_loss'][min_val_loss_idx]),
    textcoords="offset points",
    xytext=(50, 15),
    ha='center',
    arrowprops=dict(arrowstyle="->", color='black')
)

# Add labels, legend, and save plot
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.title('Attention Auto Encoder Movies Embedings RMSE Loss')
plt.tight_layout()
plt.savefig(f"movies_attention_autoencoder_loss_{ED}_{DO}.png")
plt.close()