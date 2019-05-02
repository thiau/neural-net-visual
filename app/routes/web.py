from app import app, render_template, send, emit, socketio, request
from app.factory.nn import NeuralNetClassifier
import time

model = NeuralNetClassifier()


@app.route("/", methods=["GET"])
def main():
    return render_template("main_module/index.html")


@app.route("/train", methods=["GET"])
def train_route():
    model.pre_process()
    model.train()
    return "Neural Net Training Finished"


@app.route("/predict", methods=["GET"])
def predict_route():
    text = request.args.get("text")
    print(model.predict(text))
    return "done"
