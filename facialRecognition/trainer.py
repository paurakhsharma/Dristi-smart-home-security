import cv2, os
import numpy as np
from PIL import Image

def trainer_func():
    #Initialize the recognizer and the face detector
    recogniser = cv2.face.LBPHFaceRecognizer_create()

    detector = cv2.CascadeClassifier('../facialRecognition/haarcascade_frontalface_default.xml')

    def getImagesAndLabels(path):
        #get the path of all the files in the folder
        imagePaths = [os.path.join(path,f) for f in os.listdir(path)]
        faceSamples = []
        Ids = []

        for imagePath in imagePaths:
            pilImage = Image.open(imagePath).convert('L')
            imageNp =  np.array(pilImage, 'uint8')
            Id=int(os.path.split(imagePath)[-1].split(".")[1])
            
            faces = detector.detectMultiScale(imageNp)

            for(x,y,w,h) in faces:
                faceSamples.append(imageNp[y:y+h,x:x+w])
                Ids.append(Id)
        return faceSamples, Ids        

    faces, Ids = getImagesAndLabels('../facialRecognition/dataSet')
    recogniser.train(faces, np.array(Ids))
    recogniser.save('../facialRecognition/trainer/trainer.yml')