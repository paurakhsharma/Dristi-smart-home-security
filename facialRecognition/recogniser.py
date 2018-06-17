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

    
   
    cursor1 = conn.cursor()
    cursor2 = conn.cursor()
    cursor1.execute("SELECT id FROM userlist")
    cursor2.execute("SELECT name FROM userlist")
    register1 = cursor1.fetchall()
    register2=cursor2.fetchall()
    name_list=[]
    id_list=[]
    print(register1)
    print(register2)
    for i in register1:
        #print(list(i).pop())
        id_list.append(list(i).pop())

    for a in register2:
        ai = a[-1].strip()
        name_list.append(ai)

    id_list.insert(0,0)
    name_list.insert(0,'low confidence')    
    print(name_list)
    print(id_list)

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
                pointer=id_list.index(Id)

                name = name_list[pointer]
                print(name)
                if(conf <= 55 ):
                    path = "../facialRecognition/detectedUsersLog/"+str(uuid.uuid1())+".jpg"
                    cv2.imwrite(path,image) 

                    emit('recognise', {
                        'detectedUser':name,
                        'detectedId' : Id,
                        'imagePath': path,
                        'entryTime' : timeReq
                    })

                      
                cv2.putText(image,str(name),(x,y+h),font,1,(0,255,0),2,cv2.LINE_AA)
                cv2.putText(image,str(int(conf)),(x,y),font,1,(0,0,255),2,cv2.LINE_AA)

        cv2.imshow("Image", image)
        if(cv2.waitKey(1) == ord('q')):
            cam.release()
            cv2.destroyAllWindows()      

    cam.release()
    cv2.destroyAllWindows()

# reconizer_func()
