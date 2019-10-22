
var firebase = require("firebase/app");
const express = require('express') ;
const fs = require('fs');
const bodyParser = require('body-parser');

const firebaseConfig = {
    apiKey: "AIzaSyChR6FESYhEUOJcJ3TMTZ0PdjF4TSWsfpY",
    authDomain: "mooc-content-analysis.firebaseapp.com",
    databaseURL: "https://mooc-content-analysis.firebaseio.com",
    projectId: "mooc-content-analysis",
    storageBucket: "mooc-content-analysis.appspot.com",
    messagingSenderId: "866201995875",
    appId: "1:866201995875:web:9c32e616e75430ebdf8656",
    measurementId: "G-0SSYP89GV2"
  };



firebase.initializeApp(firebaseConfig);

const app = express();
app.use(bodyParser.json());

const keyFilename="./mooc-content-analysis-firebase-adminsdk-o8avo-956b774eda.json"; //replace this with api key file
const projectId = "mooc-content-analysis" //replace with your project id
const bucketName = `${projectId}.appspot.com`;

const {Storage} = require('@google-cloud/storage');

const storage = new Storage({projectId, keyFilename});

const fileName = "success.png";
const uploadTo = 'sample/package.json';



app.get('/', function(req, res){
    res.send("Hello world!");
});
app.post('/', function(req, res){
    res.send("Post things here!");
});

app.post('/videos/:video_id/users/:user_id/emotions', function(req, res){

    let data = req.body.image;
    let base64image = data.split(';base64,').pop();
    // TODO: convert base64 string to image
    fs.writeFile('success.png', base64image, {encoding: 'base64'}, function(err) {
        console.log('File created');
    });

storage.bucket(bucketName).upload(fileName,{
    public:true,
    metadata: {contentType: 'image/png',cacheControl: "public, max-age=300"}
});

storage.bucket(bucketName).file(fileName).makePublic();


    res.json("See the emotions here at time:" + req.query.time + "for the image:");
    

});

app.listen(3001);