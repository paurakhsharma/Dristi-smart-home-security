import cv2
import uuid

from flask import jsonify,make_response,render_template

def reconizer_func():
    reconizer = cv2.face.LBPHFaceRecognizer_create()
    reconizer.read('../facialRecognition/trainer/trainer.yml')
    faceCascade = cv2.CascadeClassifier('../facialRecognition/haarcascade_frontalface_default.xml')

    cam = cv2.VideoCapture(0)
    font = cv2.FONT_HERSHEY_SIMPLEX

    while(True): 
        Id = 0
        ret, image = cam.read()
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale(gray, 1.2, 5)

        for(x,y,w,h) in faces:
            cv2.rectangle(image, (x-50,y-50),(x+w+50,y+h+50),(225,0,0),2)
            Id, conf = reconizer.predict(gray[y:y+h,x:x+w])
            if(conf >= 67):
                Id = 0
            else:
                Id = Id    
            if(Id==1):
                Id="Paurakh"
            elif(Id==2):
                Id="Bijay"
            elif(Id==3):
                Id= "Jitu"
            else:
                Id = "Low Confidence"

            if(conf <= 50 ):
                path = "../facialRecognition/detectedUsersLog/"+str(uuid.uuid1())+".jpg"
                cv2.imwrite(path,image)
                cam.release()
                cv2.destroyAllWindows()

                return(jsonify(userdetected=Id,
                                path=path))    
            cv2.putText(image,str(Id),(x,y+h),font,1,(0,255,0),2,cv2.LINE_AA)
            cv2.putText(image,str(int(conf)),(x,y),font,1,(0,0,255),2,cv2.LINE_AA)

        cv2.imshow("Image", image)
        if(cv2.waitKey(1) == ord('q')):
            break

    cam.release()
    cv2.destroyAllWindows()  
    return jsonify({'trained': "Data set has been trained"})       
