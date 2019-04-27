from app import app, render_template, send, emit, socketio
from app.factory.nn import pre_process_and_train_network
import time


@app.route("/", methods=["GET"])
def main():
    return render_template("main_module/index.html")


@app.route("/train", methods=["GET"])
def train():
    pre_process_and_train_network()
    return "Neural Net Training Started"
