# This moduble is responsible for handling requests from Node.JS server.
# The dataSet creation, traning and running the recogniser is done through here
import sys
sys.path.append('../')

from flask import Flask, jsonify, render_template, session, request
from flask_httpauth import HTTPBasicAuth
from flask_socketio import SocketIO, emit


from threading import Lock

from facialRecognition import dataSetCreator,trainer,recogniser

auth = HTTPBasicAuth()
async_mode = "threading"

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)

#Run dataSetCreator script
@app.route('/flask/api/v1.0/create/<string:name>', methods=['GET'])
def run_fecogniser(id):
    dataSetCreator.dataSetCreator_func(id,50)
    return jsonify({'created': "Data set has been created"})

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
    recogniser.reconizer_func()

if __name__== '__main__':
    socketio.run(app,debug=True)
