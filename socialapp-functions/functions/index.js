const functions = require('firebase-functions');
var admin = require('firebase-admin');
var serviceAccount = require('../key/admin.json');
const app = require('express')();
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialapp-6b1c8.firebaseio.com"
  });
//admin.initializeApp();

const config = {
    apiKey: "AIzaSyCG2pkbmqYAhBeiQFxNrJSVNRsgSVFkULQ",
    authDomain: "socialapp-6b1c8.firebaseapp.com",
    databaseURL: "https://socialapp-6b1c8.firebaseio.com",
    projectId: "socialapp-6b1c8",
    storageBucket: "socialapp-6b1c8.appspot.com",
    messagingSenderId: "825869421390",
    appId: "1:825869421390:web:7f4e2b7bf2f27391f02c1f",
    measurementId: "G-DPXWBHX84Y"
  };

const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();


//admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
 exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello world");
 });

 app.get("/scream", (req, resp) => {
    db.collection("screams").orderBy('createdAt', 'desc').get().then((data) => {
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

    db.collection("screams")
    .add(newScream)
    .then(doc => {
        resp.json({message: `Doc ${doc.id} added successfully.`});
    })
    .catch(err => {
        resp.status(500).json({error: 'Something went wrong.'});
        console.error(err);
    });
 });
 

 let toke, userId;
 app.post("/signup", (req, resp) =>{
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // TODO : validate data
    db.doc(`/user/${newUser.handle}`).get().then(doc => {
        if(doc.exists){
            return resp.status(400).json({handle: "This handle already exists"});
        }
        else{
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
    })
    .then(data => {
        userId = data.user.uid;
        return data.user.getIdToken();
    })
    .then(token => {
        token = token;
        const userCredentials = {
            email: newUser.email,
            handle: newUser.userHandle,
            createdAt: new Date().toISOString(),
            userId
        }
    })
    .catch(err =>{
        if(err.code === "auth/email-already-in-use"){
            return resp.status(400).json({email: "Email is already in use"});
        }
        else{
            console.error(err);
            return resp.status(500).resp({error: err.code});
        }       
    });

    /*firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password).then(data => {
        return resp.status(201).json({message: `User ${data.user.uid} signed up successfully.`}); //201: ressource created
    })
    .catch(err => {
        console.error(err);
        return resp.status(500).json({error: `Error signing up user: ${err.code}`});
    });*/

 });

 exports.api = functions.https.onRequest(app);