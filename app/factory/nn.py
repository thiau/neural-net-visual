from app import logging
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import accuracy_score
import app.helpers.dataset as ds
import app.helpers.tensor as ts
from app.helpers.encoder import Encoder
from app.helpers.text_process import TextProcessor
from app.network.classifier import Classifier
from app.network.training import train_nn


class NeuralNetClassifier():
    def __init__(self):
        self.count_encoder = Encoder("count", min_df=0.001)
        self.tfidf_encoder = Encoder("tfidf")
        self.model = None
        self.tensor_variables = None
        self.tensor_labels = None
        self.nb_classes = None
        self.input_size = None
        self.dataset = ds.load_pandas_dataset(
            file_name="Sarcasm_Headlines_Dataset")

    def pre_process(self):
        text_processor = TextProcessor(sentences=self.dataset["headline"])
        text_processor.process_text()
        corpus = text_processor.get_corpus()

        count_vars = self.count_encoder.encode(corpus)
        variables = self.tfidf_encoder.encode(count_vars)
        labels = self.dataset["is_sarcastic"].values

        self.tensor_variables = ts.create_float_scaled_tensor(
            variables.toarray())
        self.tensor_labels = ts.create_regular_tensor(labels)

    def train(self):
        nb_classes = 2
        input_size = len(self.tensor_variables[0])
        self.model = Classifier(input_size, nb_classes)
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(self.model.parameters(), lr=0.0001)

        train_nn(
            self.model,
            self.tensor_variables,
            self.tensor_labels,
            criterion,
            optimizer,
            epochs=300)

    def predict(self, text):
        text = [text]
        count_vars = self.count_encoder.transform(text)
        variables = self.tfidf_encoder.transform(count_vars)

        tensor_variables = ts.create_float_scaled_tensor(variables.toarray())
        return self.model.predict(tensor_variables)

    def get_accuracy(self):
        accuracy = accuracy_score(
            self.model.predict(self.tensor_variables), self.tensor_labels)
        return accuracy
