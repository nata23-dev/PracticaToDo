const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();
const app = express();

// Configure CORS for http://127.0.0.1:5500
app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(express.json());

// GET /todos
app.get('/todos', async (req, res) => {
    try {
        const snapshot = await db.collection('todos').orderBy('serverTimestamp', 'desc').get();
        const todos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).send(todos);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST /todos
app.post('/todos', async (req, res) => {
    try {
        const { title, description } = req.body;
        const newTodo = {
            title,
            description,
            completed: false,
            serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('todos').add(newTodo);
        res.status(201).send({ id: docRef.id, ...newTodo });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// PUT /todos/:id
app.put('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // If updating specific fields like 'completed'
        await db.collection('todos').doc(id).update(updates);
        res.status(200).send({ message: 'Todo updated' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// DELETE /todos/:id
app.delete('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('todos').doc(id).delete();
        res.status(200).send({ message: 'Todo deleted' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

exports.api = functions.https.onRequest(app);
