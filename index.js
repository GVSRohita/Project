
var firebase = require("firebase/app");
require('firebase/database');
const {Storage} = require('@google-cloud/storage');

const express = require('express') ;
const fs = require('fs');
const bodyParser = require('body-parser');
'use strict';

const request = require('request');


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




const app = express();
firebase.initializeApp(firebaseConfig);


app.use(bodyParser.json({limit: '100mb'}));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
const keyFilename="./mooc-content-analysis-firebase-adminsdk-o8avo-956b774eda.json"; //replace this with api key file
const projectId = "mooc-content-analysis" //replace with your project id
const bucketName = `${projectId}.appspot.com`;


const storage = new Storage({projectId, keyFilename});


app.get('/', function(req, res){
    res.send("Hello world!");
});
app.post('/', function(req, res){
    res.send("Post things here!");
});

app.post('/videos/:video_id/users/:user_id/emotions', function(req, res){

    var fileName = new Date().getTime() +".png";

    var video_id = req.params.video_id;
    var user_id = req.params.user_id;
    var time = req.query.time;
    let data = req.body.image;

    var buff = new Buffer(data.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');


    let base64image = data.split(';base64,').pop();
    // TODO: convert base64 string to image
    fs.writeFile(fileName, base64image, {encoding: 'base64'}, function(err) {
        console.log('File created');
    });

storage.bucket(bucketName).upload(fileName,{
    gzip: true,
    public:true,
    metadata: {contentType: 'image/png',cacheControl: "public, max-age=31536000"}
});

storage.bucket(bucketName).file(fileName).makePublic();

console.log('gs://${bucketName}/${filename} is now public.');


// Replace <Subscription Key> with your valid subscription key.
const subscriptionKey = '595980504167406f9cee21939abc1034';

// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriBase = 'https://emotionanalysis.cognitiveservices.azure.com/face/v1.0/detect';
var url = 'https://storage.googleapis.com/mooc-content-analysis.appspot.com/' + fileName;

// const imageUrl = url;


// Request parameters.
const params = {
    'returnFaceId': 'true',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes': 'emotion'
};

const options = {
    uri: uriBase,
    qs: params,
    body: buff,
    headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
    }
};
let jsonResponse;
request.post(options, (error, response, body) => {
  if (error) {
    console.log('Error: ', error);
    return;
  }
    jsonResponse = JSON.stringify(response);
  console.log('JSON Response\n');
var db = firebase.database();
var ref = db.ref("/videos/"+ video_id + "/users/"+ user_id+ "/" + time);
emotion_response = JSON.parse(response.body);
console.log(emotion_response);
//console.log(ref.anger);
ref.set({
    happiness: emotion_response[0]["faceAttributes"]["emotion"]["happiness"],
    anger: emotion_response[0]["faceAttributes"]["emotion"]["anger"],
    contempt: emotion_response[0]["faceAttributes"]["emotion"]["contempt"],
    disgust: emotion_response[0]["faceAttributes"]["emotion"]["disgust"],
    fear: emotion_response[0]["faceAttributes"]["emotion"]["fear"],
    neutral: emotion_response[0]["faceAttributes"]["emotion"]["neutral"],
    sadness: emotion_response[0]["faceAttributes"]["emotion"]["sadness"],
    surprise: emotion_response[0]["faceAttributes"]["emotion"]["surprise"]
}
);


    res.send(response.body);
});

 
   
});

app.listen(3001);