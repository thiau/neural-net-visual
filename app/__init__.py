import logging
import app.helpers.dataset as ds
import app.helpers.tensor as ts
from app.helpers.encoder import Encoder
from app.helpers.text_process import TextProcessor
from app.network.classifier import Classifier
from app.network.training import train_nn

logging.basicConfig(level=logging.INFO)
