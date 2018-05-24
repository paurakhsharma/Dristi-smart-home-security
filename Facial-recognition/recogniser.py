import cv2, time
import pandas
import numpy as np
from datetime import datetime


reconizer = cv2.face.LBPHFaceRecognizer_create()
reconizer.read('trainer/trainer.yml')
faceCascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

cam = cv2.VideoCapture(0)
font = cv2.FONT_HERSHEY_SIMPLEX

df=pandas.DataFrame(columns=["Entry","Exit","Person"])
status=0
status_list=[0, 0]
times=[]
per=""

while(True):
    Id = 0
    status = 0
    ret, image = cam.read()
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = faceCascade.detectMultiScale(gray, 1.2, 5)

    for(x,y,w,h) in faces:
        cv2.rectangle(image, (x-50,y-50),(x+w+50,y+h+50),(225,0,0),2)
        Id, conf = reconizer.predict(gray[y:y+h,x:x+w])
        if(conf >= 67):
            Id = 0
            status = 0
        else:
            Id = Id    
        if(Id==1):
            Id = "Niranjan"
            per="Niranjan"
            status=1
        elif(Id==2):
            Id="Saugat"
            status=1
        elif(Id==3):
            Id= "Jitu"
            status=1
        elif(Id==4):
            Id="manchhe"
            status=1    
        else:
            Id = "Low Confidence" 

        cv2.putText(image,str(Id),(x,y+h),font,1,(0,255,0),2,cv2.LINE_AA)
        cv2.putText(image,str(int(conf)),(x,y),font,1,(0,0,255),2,cv2.LINE_AA)
    

    
    status_list.append(status)  
    if status_list[-1]==1 and status_list[-2]==0:
        times.append(datetime.now())
    if status_list[-1]==0 and status_list[-2]==1:
        times.append(datetime.now())        


    cv2.imshow("Image", image)
    if(cv2.waitKey(1) == ord('q')):
        break


print(status_list)
#print("time....................................................................")
#print(times)
print(per)
for i in range(0, len(times), 2):
    df=df.append({"Entry":times[i],"Exit":times[i+1],"Person":str(per)},ignore_index=True)
df.to_csv("times.csv")
cam.release()
cv2.destroyAllWindows()        
