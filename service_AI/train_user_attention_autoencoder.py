from data import load_dataset
from settings import MOVIE_LENS_100k_DATASET_PATH
from models import AttentionAutoEncoder
import torch
from helper import masked_rmse_loss
import matplotlib.pyplot as plt
import copy

# setting parameters
ED = 64 
DO = 0.5
device = 'cuda' if torch.cuda.is_available() else 'cpu'
epochs = 500
patience = 30
min_delta = 1e-4

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
model = AttentionAutoEncoder(movies_features.size(0), embedding_dim=ED, dropout=DO, users_features=users_features.to(torch.float32).to(device)).to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-5)
history: dict = {
    'train_loss':[],
    'val_loss': []
    }
best_val_loss = float('inf')
best_epoch = 0
best_weights = copy.deepcopy(model.state_dict())
patience_counter = 0

for epoch in range(epochs):
    model.train()

    optimizer.zero_grad()
    x_pred = model(train_rating_matrix)
    loss = masked_rmse_loss(train_rating_matrix, x_pred)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
    optimizer.step()
    running_loss = loss.item()

    model.eval()
    with torch.no_grad():
        x_pred = model(train_rating_matrix)
    val_running_loss = masked_rmse_loss(val_rating_matrix, x_pred).item()
    
    if val_running_loss + min_delta < best_val_loss:
        best_val_loss = val_running_loss
        best_epoch = epoch+1
        best_weights = copy.deepcopy(model.state_dict())
        patience_counter = 0
        print('best weights updated...')
    else:
        patience_counter += 1

    history['train_loss'].append(running_loss)
    history['val_loss'].append(val_running_loss)

    print(f'[{epoch+1}/{epochs}] loss:{running_loss:.4f}, val_loss: {val_running_loss:.4f}, best_loss: {best_val_loss:.4f}')

    if patience_counter >= patience:
        print(f'Early stopping at epoch {epoch+1}; best epoch was {best_epoch} with val_loss {best_val_loss:.4f}')
        break


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

# Add labels, legend, and show plot
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.title('Attention Auto Encoder Users Embedings RMSE Loss')
plt.show()

# extracting users embeddings
train_rating_matrix = train_rating_matrix + val_rating_matrix

model.load_state_dict(best_weights)
model.eval()

with torch.no_grad():
    users_embeddings = model.encoder(train_rating_matrix)

torch.save(users_embeddings, f"users_embeddings_attention_autoencoder_{ED}_{DO}.pt")