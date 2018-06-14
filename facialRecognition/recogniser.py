import cv2
import uuid
import time
import psycopg2

from flask import jsonify,make_response,render_template,session
from flask_socketio import emit

def reconizer_func():


    try:
        conn = psycopg2.connect(database="dristidb", user="postgres", password="admin", port=5433)
        print("connected")
    except:
        print("I am unable to connect to the database")

    cursor = conn.cursor()
    cursor.execute("SELECT name FROM userlist")
    records = cursor.fetchall()
    record=[]
    for a in records:
        ai = a[-1].strip()
        record.append(ai)
    
    
    record.insert(0,'lowconfident')
    print(record)

    timeReq = time.strftime("%d/%m/%Y %H:%M")
    reconizer = cv2.face.LBPHFaceRecognizer_create()
    reconizer.read('../facialRecognition/trainer/trainer.yml')
    faceCascade = cv2.CascadeClassifier('../facialRecognition/haarcascade_frontalface_default.xml')
    
    cam = cv2.VideoCapture(0)
    font = cv2.FONT_HERSHEY_SIMPLEX

    while(True): 
        Id = 0
        id=int(0)
        ret, image = cam.read()
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale(gray, 1.2, 5)

        for(x,y,w,h) in faces:
            Id, conf = reconizer.predict(gray[y:y+h,x:x+w])
            if(conf <= 90):
                cv2.rectangle(image, (x-50,y-50),(x+w+50,y+h+50),(225,0,0),2)
                if(conf >= 67):
                    Id = 0
                else:
                    Id = Id    
                

                print(Id)
                print(type(Id))
                Id = record[Id]
                if(conf <= 55 ):
                    path = "../facialRecognition/detectedUsersLog/"+str(uuid.uuid1())+".jpg"
                    cv2.imwrite(path,image) 

                    emit('recognise', {
                        'detectedUser': Id,
                        'detectedId' : id,
                        'imagePath': path,
                        'entryTime' : timeReq
                    })
                      
                cv2.putText(image,str(Id),(x,y+h),font,1,(0,255,0),2,cv2.LINE_AA)
                cv2.putText(image,str(int(conf)),(x,y),font,1,(0,0,255),2,cv2.LINE_AA)

        cv2.imshow("Image", image)
        if(cv2.waitKey(1) == ord('q')):
            cam.release()
            cv2.destroyAllWindows()      

    cam.release()
    cv2.destroyAllWindows()

# reconizer_func()
