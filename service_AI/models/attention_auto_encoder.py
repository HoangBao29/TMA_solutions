import torch
import torch.nn as nn

class AttentionAutoEncoder(nn.Module):
    def __init__(self, input_dim, embedding_dim=64, dropout=0.5, users_features=None):
        super(AttentionAutoEncoder, self).__init__()
        if users_features is None:
            raise ValueError("users_features must be provided for information-aware attention.")
        self.input_dim = input_dim
        self.dropout = dropout
        self.users_features = users_features

        side_info_dim = users_features.size(1)
        self.info_encoder = nn.Sequential(
            nn.Linear(side_info_dim, embedding_dim * 2, bias=True),
            nn.LeakyReLU(),
            nn.Linear(embedding_dim * 2, embedding_dim, bias=True)
        )
        self.attention = nn.Softmax(dim=1)
        self.layer_norm = nn.LayerNorm(embedding_dim)
        self.alpha = nn.Parameter(torch.tensor(0.5))
        self.encoder = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(input_dim, embedding_dim * 2),
            nn.LeakyReLU(),
            nn.Linear(embedding_dim * 2, embedding_dim),
            nn.LeakyReLU()
            )
        self.decoder = nn.Sequential(
            nn.Linear(embedding_dim, embedding_dim * 2),
            nn.LeakyReLU(),
            nn.Linear(embedding_dim * 2, input_dim),
            nn.LeakyReLU()
            )

    def encode_with_attention(self, x):
        encoded = self.encoder(x)

        info_latent = self.info_encoder(self.users_features)
        attention_weights = self.attention(info_latent)

        encoded_attended = attention_weights * encoded
        encoded = self.alpha * encoded_attended + (1 - self.alpha) * encoded
        encoded = self.layer_norm(encoded)
        return encoded

    def forward(self, x):
        encoded = self.encode_with_attention(x)
        decoded = self.decoder(encoded)
        return decoded