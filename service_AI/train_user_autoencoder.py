from data import load_dataset
from settings import MOVIE_LENS_100k_DATASET_PATH
from models import AutoEncoder
import torch
from helper import masked_rmse_loss
from adopt import ADOPT
import copy
import matplotlib.pyplot as plt

# setting parameters
ED = 64
DO = 0.5
device = 'cuda' if torch.cuda.is_available() else 'cpu'
epochs = 1000

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

# training user embedder model
model = AutoEncoder(movies_features.size(0), embedding_dim=ED, dropout=DO).to(device)
optimizer = ADOPT(model.parameters(), lr=1e-3, weight_decay=1e-5)
history: dict = {
    'train_loss':[],
    'val_loss': []
    }

best_val_loss = float('inf')
best_epoch = 0
for epoch in range(epochs):
    # train model
    model.train()
    running_loss = 0.0
    optimizer.zero_grad()
    x_pred = model(train_rating_matrix)
    loss = masked_rmse_loss(train_rating_matrix, x_pred)
    loss.backward()
    optimizer.step()
    running_loss = loss.item()

    # validate model
    model.eval()
    x_pred = model(train_rating_matrix)
    val_running_loss = masked_rmse_loss(val_rating_matrix, x_pred).item()
    
    if val_running_loss <= best_val_loss:
        best_val_loss = val_running_loss
        best_epoch = epoch+1
        best_weights = copy.deepcopy(model.state_dict())
        print('best weights updated...')
    history['train_loss'].append(running_loss)
    history['val_loss'].append(val_running_loss)

    print(f'[{epoch+1}/{epochs}] loss:{running_loss:.4f}, val_loss: {val_running_loss:.4f}')


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
plt.title('Auto Encoder Users Embedings RMSE Loss')
plt.show()

# extracting users embeddings
train_rating_matrix = train_rating_matrix + val_rating_matrix

with torch.no_grad():
    users_embeddings = model.encoder(train_rating_matrix)

torch.save(users_embeddings, f"users_embeddings_autoencoder_{ED}_{DO}.pt")