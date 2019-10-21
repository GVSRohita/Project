
var firebase = require("firebase/app");
const express = require('express') ;
require("firebase/storage");

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

app.get('/', function(req, res){
    res.send("Hello world!");
});
app.post('/', function(req, res){
    res.send("Post things here!");
});

app.post('/videos/:video_id/users/:user_id/emotions', function(req, res){

    var storageRef = firebase.storage().ref('images').child('image1');
    // console.log(storageRef);

    var uploadTask = storageRef.putString(req.query.image, 'base64', {contentType:'image/png'});

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
  function(snapshot) {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
  }, function(error) {
    console.log(error);
}, function() {
  // Upload completed successfully, now we can get the download URL
  var downloadURL = uploadTask.snapshot.downloadURL;
//   console.log(downloadURL);
});

    res.json("See the emotions here at time:" + req.query.time + "for the image:");
    

});

app.listen(3001);