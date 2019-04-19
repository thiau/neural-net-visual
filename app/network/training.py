""" Training Management Module """
from app import logging


def train_nn(model, input_data, labels, criterion, optimizer, epochs=5000):
    """ Train the Neural Network """
    losses = list()
    for e in range(epochs):
        y_pred = model.forward(input_data)
        loss = criterion(y_pred, labels)
        logging.info("Epoch %s Error: %f", e, loss)
        losses.append(loss.item())
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
