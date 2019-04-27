from app import app, render_template, send, emit, socketio
from app.factory.nn import pre_process_and_train_network
import time


@app.route("/", methods=["GET"])
def main():
    return render_template("main_module/index.html")


@app.route("/train", methods=["GET"])
def train():
    pre_process_and_train_network()


@app.route("/socket", methods=["GET"])
def socket():
    # emit('test', {"testando"}, namespace="/chat")
    # # send('test', "testando", namespace='/chat')
    # print("ok")
    # socketio.emit('test', "jdadashidsaihu", namespace="/chat")
    for x in range(100, 0, -1):
        time.sleep(.5)
        socketio.emit('test', ["2018", x], namespace="/chat")
    return "funfou"
