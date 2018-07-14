var nodemailer = require('nodemailer');
var fs=require('fs');
//var express = require('express');
//var app=express();
//var path= require('path');



module.exports={
    notify_Users:function(detected,imagePath,recipients){
        //app.use(express.static(path.join(__dirname, 'public')));
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'dristi.nepal2018@gmail.com',
              pass: 'minorproject2018'
            }
          });
          
          var mailOptions = {
            from: 'Dristi Smart Home Security <dristi.nepal2018@gmail.com>',
            //from: 'Dristi Smart-Home-Security <dristi.nepal2018@gmail.com>',
            to: recipients,
            subject: 'Sending Email using Node.js',
            text: detected + ' is at your door',
            attachments: [{   // stream as an attachment
                filename: imagePath,
                content: fs.createReadStream(__dirname+'/../facialRecognition/detectedUsersLog/'+imagePath)
            }]
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    }
}

