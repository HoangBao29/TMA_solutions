import torch.nn as nn

class AutoEncoder(nn.Module):
    def __init__(self,
                 input_dim,
                 embedding_dim=64,
                 dropout=0.5):
        super(AutoEncoder, self).__init__()
        self.input_dim = input_dim
        self.dropout = dropout

        self.encoder = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(input_dim, embedding_dim),
            nn.LeakyReLU(),
            nn.Linear(embedding_dim, embedding_dim),
            nn.LeakyReLU()
            )

        self.decoder = nn.Sequential(
            nn.Linear(embedding_dim, embedding_dim),
            nn.LeakyReLU(),
            nn.Linear(embedding_dim, input_dim),
            nn.LeakyReLU()
            )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded