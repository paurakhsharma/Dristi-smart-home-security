import cv2
import os
import sys


from flask import jsonify

def dataSetCreator_func(id, noOfSamples):
    cam = cv2.VideoCapture(0)
    faceDetector = cv2.CascadeClassifier("../facialRecognition/haarcascade_frontalface_default.xml")
    
    sampleNum = 0
    Id = id;

    while(True):
        ret, image = cam.read()
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        face = faceDetector.detectMultiScale(gray, 1.3, 5)
        for(x,y,w,h) in face:
            sampleNum += 1
            cv2.imwrite("../facialRecognition/dataSet/user."+str(Id)+"."+str(sampleNum)+".jpg",gray[y:y+h,x:x+w])
            cv2.rectangle(image,(x,y),(x+w,y+h),(0,0,255),2)
            cv2.waitKey(200)

        cv2.imshow("show", image)
        cv2.waitKey(1)  
        if(sampleNum >= noOfSamples):
            break    
    cam.release()
    cv2.destroyAllWindows()        