from app import app, socketio
from app.routes import web
import time

if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=8080, debug=True)
    socketio.run(app, host="0.0.0.0", port=8080, debug=True)
