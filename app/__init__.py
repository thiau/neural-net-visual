import logging
from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, send, emit

logging.basicConfig(level=logging.INFO)
app = Flask(__name__, template_folder="../client", static_folder="../client")

app.config['SECRET_KEY'] = 'nn-visual!'
socketio = SocketIO(app)
