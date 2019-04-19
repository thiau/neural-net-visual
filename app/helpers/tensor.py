import torch
from sklearn.preprocessing import StandardScaler


def create_float_scaled_tensor(variables: list):
    scaler = StandardScaler()
    variables = scaler.fit_transform(variables)
    variables = torch.FloatTensor(variables)
    return variables


def create_regular_tensor(dataset):
    return torch.tensor(dataset)
