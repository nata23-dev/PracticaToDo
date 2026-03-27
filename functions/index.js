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

// GET /todos/:id
app.get('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('todos').doc(id).get();
        if (!doc.exists) {
            return res.status(404).send({ message: 'Todo not found' });
        }
        res.status(200).send({ id: doc.id, ...doc.data() });
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

// PUT /todos/toggle-all
app.put('/todos/toggle-all', async (req, res) => {
    try {
        const { completed } = req.body;
        if (typeof completed !== 'boolean') {
            return res.status(400).send({ message: "'completed' boolean field is required" });
        }

        const snapshot = await db.collection('todos').get();
        if (snapshot.empty) {
            return res.status(200).send({ message: 'No todos to update' });
        }

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { completed });
        });
        await batch.commit();

        res.status(200).send({ message: `All todos marked as ${completed ? 'completed' : 'pending'}` });
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

// DELETE /todos/completed
app.delete('/todos/completed', async (req, res) => {
    try {
        const snapshot = await db.collection('todos').where('completed', '==', true).get();
        if (snapshot.empty) {
            return res.status(200).send({ message: 'No completed todos to delete' });
        }
        
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        res.status(200).send({ message: 'Completed todos deleted' });
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
module.exports = app; // Exporta la aplicación para pruebas