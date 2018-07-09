# This moduble is responsible for handling requests from Node.JS server.
# The dataSet creation, traning and running the recogniser is done through here
import sys
sys.path.append('../')

from flask import Flask, jsonify, render_template, session, request, redirect
from flask_httpauth import HTTPBasicAuth
from flask_socketio import SocketIO, emit, disconnect


from threading import Lock

from facialRecognition import dataSetCreator,trainer,recogniser

auth = HTTPBasicAuth()
async_mode = "threading"

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)

#Run dataSetCreator script
@app.route('/flask/api/v1.0/create/', methods=['POST'])
def run_fecogniser():
    dataSetCreator.dataSetCreator_func(50)
    return redirect('https://localhost:4000/')

#Train the imageDataSet
@app.route('/flask/api/v1.0/train', methods=['GET'])
def train_dataSet():
    trainer.trainer_func()
    return jsonify({'trained': "Data set has been trained"})  

# Run the recogniser
# @app.route('/flask/api/v1.0/recognise', methods=['GET'])
# def recognise_faces():
#     return(recogniser.reconizer_func())

@app.route("/")
def index():
    return render_template('index.html',)

@socketio.on('send_message')
def handle_source():
    print('handel source has been called')
    recogniser.reconizer_func(disconnect)

if __name__== '__main__':
    socketio.run(app,debug=True)
