""" Training Management Module """
from app import logging, socketio
from sklearn.metrics import accuracy_score


def train_nn(model, input_data, labels, criterion, optimizer, epochs=5000):
    """ Train the Neural Network """
    losses = list()
    for e in range(epochs):
        y_pred = model.forward(input_data)
        loss = criterion(y_pred, labels)
        accuracy = accuracy_score(model.predict(input_data), labels)
        # logging.info("Epoch %s Error: %f", e, loss)
        # logging.info("Accuracy: %f", accuracy)
        socketio.emit(
            'trainingInfo', {
                "epoch": e,
                "accuracy": accuracy,
                "loss": loss.item()
            },
            namespace="/chat")
        losses.append(loss.item())
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
