# This moduble is responsible for handling requests from Node.JS server.
# The dataSet creation, traning and running the recogniser is done through here
import sys
sys.path.append('../')

from flask import Flask, jsonify, abort, make_response,request
from flask_httpauth import HTTPBasicAuth

from facialRecognition import dataSetCreator,trainer,recogniser

auth = HTTPBasicAuth()

app = Flask(__name__)

@auth.get_password
def get_password(username):
    if username == 'paurakh':
        return 'sublimeuser'
    return None

@auth.error_handler
def unauthorized():
    return make_response(jsonify({'error': 'Unauthorized access'}), 403)    

#Run dataSetCreator script
@app.route('/flask/api/v1.0/create/<int:id>', methods=['GET'])
def run_fecogniser(id):
    dataSetCreator.dataSetCreator_func(id,50)
    return jsonify({'created': "Data set has been created"})

#Train the imageDataSet
@app.route('/flask/api/v1.0/train', methods=['GET'])
def train_dataSet():
    trainer.trainer_func()
    return jsonify({'trained': "Data set has been trained"})  

#Run the recogniser
@app.route('/flask/api/v1.0/recognise', methods=['GET'])
def recognise_faces():
    return(recogniser.reconizer_func())

# @app.errorhandler(404)
# def not_found(error):
#     return make_response(jsonify({'error': 'Not found'}), 404)

# #Run dataSetCreator script for a given username
# @app.route('/todo/api/v1.0/task', methods=['POST'])
# @auth.login_required
# def create_task():
#     if not request.json or not 'title' in request.json:
#         abort(400)
#     task = {
#         'id': tasks[-1]['id']+1,
#         #Title is the required key
#         'title': request.json['title'],
#         #Discription is not an required key
#         'description': request.json.get('description'),
#         'done': False
#     }
#     tasks.append(task)
#     return jsonify({'task': task}), 201

# #Edit a username
# @app.route('/todo/api/v1.0/task/<int:task_id>', methods=['PUT'])
# @auth.login_required
# def update_task(task_id):
#     task = [task for task in tasks if task['id'] == task_id]
#     if len(task) == 0:
#         abort(404)
#     if not request.json:
#         abort(400)
#     if 'title' in request.json and type(request.json['title']) != str:
#         abort(400)
#     if 'description' in request.json and type(request.json['description']) is not str:
#         abort(400)
#     if 'done' in request.json and type(request.json['done']) is not bool:
#         abort(400)

#     task[0]['title'] = request.json.get('title', task[0]['title'])
#     task[0]['description'] = request.json.get('description', task[0]['description'])                
#     task[0]['done'] = request.json.get('done', task[0]['done'])

#     return jsonify({'task':task[0]})

# #Deleta an user
# @app.route('/flask/api/v1.0/task/<int:task_id>', methods=['DELETE'])
# @auth.login_required
# def delete_task(task_id):
#     task = [task for task in tasks if task['id'] == task_id]
#     if len(task) == 0:
#         abort(404)
#     tasks.remove(task[0])

#     return jsonify({'result': True})    

if __name__== '__main__':
    app.run(debug=True, threaded=True)
