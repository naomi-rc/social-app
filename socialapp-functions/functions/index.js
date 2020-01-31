const functions = require('firebase-functions');
var admin = require('firebase-admin');
var serviceAccount = require('../key/admin.json');
const express = require('express');
const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialapp-6b1c8.firebaseio.com"
});
//admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
 exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello world");
 });

 app.get("/scream", (req, resp) => {
    admin.firestore().collection("screams").orderBy('createdAt', 'desc').get().then((data) => {
        let screams = [];
        data.forEach(doc => screams.push({
            screamId: doc.id,
            userHandle: doc.data().userHandle,
            body: doc.data().body,
            createdAt: doc.data().createdAt
        }));
        return resp.json(screams);
    })
    .catch((err) => console.error(err));
 });

 app.post("/scream", (req, resp) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
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
 

 exports.api = functions.https.onRequest(app);