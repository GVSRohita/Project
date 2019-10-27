
var firebase = require("firebase/app");
require('firebase/database');

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

const keyFilename="./mooc-content-analysis-firebase-adminsdk-o8avo-956b774eda.json"; //replace this with api key file
const projectId = "mooc-content-analysis" //replace with your project id
const bucketName = `${projectId}.appspot.com`;

const {Storage} = require('@google-cloud/storage');

const storage = new Storage({projectId, keyFilename});

const fileName = "success.jpg";
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
    fs.writeFile('success.jpg', base64image, {encoding: 'base64'}, function(err) {
        console.log('File created');
    });

storage.bucket(bucketName).upload(fileName,{
    public:true,
    metadata: {contentType: 'image/jpeg',cacheControl: "public, max-age=300"}
});

storage.bucket(bucketName).file(fileName).makePublic();

// Replace <Subscription Key> with your valid subscription key.
const subscriptionKey = '595980504167406f9cee21939abc1034';

// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriBase = 'https://emotionanalysis.cognitiveservices.azure.com/face/v1.0/detect';

const imageUrl =
    'https://storage.googleapis.com/mooc-content-analysis.appspot.com/success.jpg';


// Request parameters.
const params = {
    'returnFaceId': 'true',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes':   'emotion'
};

const options = {
    uri: uriBase,
    qs: params,
    body: '{"url": ' + '"' + imageUrl + '"}',
    headers: {
        'Content-Type': 'application/json',
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
    console.log(imageUrl);
  console.log('JSON Response\n');
//   console.log(jsonResponse);

var database = firebase.database();
database.ref('users/'+ req.params.user_id).set(response.body);
res.send(response.body);
});

 
   
});

app.listen(3001);