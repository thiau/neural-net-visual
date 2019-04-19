import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import accuracy_score
from app import ds, ts, TextProcessor, Encoder, Classifier, train_nn, logging

# Load Pandas Dataset
dataset = ds.load_pandas_dataset(file_name="Sarcasm_Headlines_Dataset")

# Text Pre Processing
text_processor = TextProcessor(sentences=dataset["headline"])
text_processor.process_text()
corpus = text_processor.get_corpus()

# Create Text Encoders
count_encoder = Encoder("count", min_df=0.001)
tfidf_encoder = Encoder("tfidf")

# Encode Variables
count_vars = count_encoder.encode(corpus)
variables = tfidf_encoder.encode(count_vars)

# Assingn Labels to variable
labels = dataset["is_sarcastic"].values

# Create Tensor from Variables
X = ts.create_float_scaled_tensor(variables.toarray())
y = ts.create_regular_tensor(labels)

# Define Neural Net Basic Parameters
nb_classes = 2
input_size = len(X[0])

# Create Neural Net Classifier
model = Classifier(input_size, nb_classes)

# Define Training Parameters
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.0001)

# Train the Neural Net
train_nn(model, X, y, criterion, optimizer, epochs=300)

# Compute Accuracy
accuracy = accuracy_score(model.predict(X), y)
logging.info("Accuracy is: %s", accuracy)
