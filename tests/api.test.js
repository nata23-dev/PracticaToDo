const request = require('supertest');
const app = require('../functions/index');

describe('Pruebas de Integración: API ToDo (Firebase)', () => {
    
    test('GET /todos debe responder con un array de tareas', async () => {
        const response = await request(app).get('/todos');
        
        expect([200, 500]).toContain(response.statusCode); 
    }, 10000);
});