const functions = require('firebase-functions');
var admin = require("firebase-admin");
var serviceAccount = require("../key/admin.json");
const express = require('express');


const app = express();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialapp-6b1c8.firebaseio.com"
});


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
 exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello world");
 });

 exports.getScreams = functions.https.onRequest((req, resp) => {
    admin.firestore().collection("screams").get().then((data) => {
        let screams = [];
        data.forEach(doc => screams.push(doc.data()));
        return resp.json(screams);
    })
    .catch((err) => console.error(err));
 });

 exports.getScreamUser = functions.https.onRequest((req, resp) =>{
    admin.firestore().collection('screams').get().then((data) =>{
        let screamUsers = [];
        data.forEach(doc => screamUsers.push(doc.data()["userHandle"]));
        return resp.json(screamUsers);
    })
    .catch((err) => console.error(err));

 });

 exports.createScream = functions.https.onRequest((req, resp) => {
    if(req.method != "POST"){
        return resp.status(400).json({error: 'Bad request - method not allowed'});
    }
    
     const newScream = {
         body: req.body.body,
         userHandle: req.body.userHandle,
         createdAt: admin.firestore.Timestamp.fromDate(new Date())
     };

     admin.firestore().collection("screams")
     .add(newScream)
     .then(doc => {
         resp.json({message: `Doc ${doc.id} added successfully.`});
     })
     .catch(err => {
         resp.status(500).json({error: 'Something went wrong.'});
         console.error(err);
     });
 });