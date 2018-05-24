import cv2
import numpy as np
import os



if not os.path.exists('./dataSet'):
    os.makedirs('./dataSet')

if not os.path.exists('./trainer'):
    os.makedirs('./trainer')

faceDetector = cv2.CascadeClassifier("haarcascade_frontalface_default.xml");
cam = cv2.VideoCapture(0)
sampleNum = 0
Id = input("Enter userId: ")

while(True):
    ret, image = cam.read()
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    face = faceDetector.detectMultiScale(gray, 1.3, 5)
    for(x,y,w,h) in face:
        sampleNum += 1
        cv2.imwrite("dataSet/user."+str(Id)+"."+str(sampleNum)+".jpg",gray[y:y+h,x:x+w])
        cv2.rectangle(image,(x,y),(x+w,y+h),(0,0,255),2)
        cv2.waitKey(200)

    cv2.imshow("show", image);
    cv2.waitKey(1)  
    if(sampleNum >= 200):
        break    
cam.release()
cv2.destroyAllWindows()        