const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, start } = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

chai.use(chaiHttp);
const expect = chai.expect;

describe('App Tests', function() {
    let server;
    let agent;
    let testUser;
    let baseURL;

    before(async function() {
        this.timeout(10000);
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await start();
        server = app.listen();
        baseURL = `http://127.0.0.1:${server.address().port}`;
        agent = chai.request.agent(server);
        agent.baseURL = baseURL;
    });

    after(async function(done) {
        await User.deleteMany({});
        await mongoose.disconnect();
        server.close((err) => {
            if (err) {
                console.error("Error closing server:", err);
            } else {
                console.log("Server Closed. Port: " + server.address().port);
            }
            done();
        });
    });

    beforeEach(async function() {
        await User.deleteMany({});
        testUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        });
        await testUser.save();
        agent = chai.request.agent(server);
        agent.baseURL = baseURL;
    });

    afterEach(async function() {
        await agent.close();
    });

    it('should register a new user', async function() {
        console.log("Starting register new user test. Port: " + server.address().port);
        const res = await agent
            .post('/sessions/register')
            .type('form')
            .send({
                name: 'New User',
                email: 'new@example.com',
                password: 'password123',
                password1: 'password123',
            });
        console.log("Finished register new user test. Port: " + server.address().port);
        expect(res).to.redirectTo(agent.baseURL + '/');
        const newUser = await User.findOne({ email: 'new@example.com' });
        expect(newUser).to.not.be.null;
    });


    describe('Session Routes', function() {
        it('should render the register page', async function() {
            const res = await agent.get('/sessions/register');
            expect(res).to.have.status(200);
            expect(res.text).to.include('Register');
        });

        it('should register a new user', async function() {
            console.log("Starting register new user test. Port: " + server.address().port);
            const res = await agent
                .post('/sessions/register')
                .type('form')
                .send({
                    name: 'New User',
                    email: 'new@example.com',
                    password: 'password123',
                    password1: 'password123',
                });
            console.log("Finished register new user test. Port: " + server.address().port);
            expect(res).to.redirectTo(agent.baseURL + '/');
            const newUser = await User.findOne({ email: 'new@example.com' });
            expect(newUser).to.not.be.null;
        });

        it('should render the logon page', async function() {
            const res = await agent.get('/sessions/logon');
            expect(res).to.have.status(200);
            expect(res.text).to.include('Logon');
        });

        it('should log in a user', async function() {
            const res = await agent
                .post('/sessions/logon')
                .type('form')
                .send({
                    email: 'test1@example.com',
                    password: 'password123',
                });
            expect(res).to.redirectTo(agent.baseURL + '/');
            const sessionRes = await agent.get(agent.baseURL);
            expect(sessionRes.text).to.include('Test User is logged on');
        });

        it('should log out a user', async function() {
            await agent.post('/sessions/logon').send({
                email: 'test@example.com',
                password: 'password123',
            });
            const res = await agent.post('/sessions/logoff');
            expect(res).to.redirectTo(agent.baseURL + '/');

            await agent.get('/clearSessionForTest');

            const sessionRes = await agent.get(agent.baseURL);
            expect(sessionRes.text).to.not.include('Test User is logged on');
        });
    });

    describe('Secret Word Route', function() {
        it('should redirect to logon if not logged in', async function() {
            const res = await agent.get('/secretWord');
            expect(res).to.redirectTo(agent.baseURL + '/sessions/logon');
        });

        it('should access secret word page if logged in', async function() {
            await agent.post('/sessions/logon').send({
                email: 'test@example.com',
                password: 'password123',
            });
            const res = await agent.get('/secretWord');
            expect(res).to.have.status(200);
            expect(res.text).to.include('The secret word is: syzygy');
        });

        it('should change secret word', async function() {
            await agent.post('/sessions/logon').send({
                email: 'test@example.com',
                password: 'password123',
            });
            const res = await agent.post('/secretWord').send({
                secretWord: 'newWord',
            });
            expect(res).to.redirectTo(agent.baseURL + '/secretWord');
            const sessionRes = await agent.get('/secretWord');
            expect(sessionRes.text).to.include('The secret word is: newWord');
        });

    });

    describe('Error Handling', function() {
        it('should return 404 for non-existent page', async function() {
            const res = await agent.get('/nonexistent');
            expect(res).to.have.status(404);
        });
    });

    describe('Index Route', function() {
        it('should render the index page', async function() {
            const res = await agent.get('/');
            expect(res).to.have.status(200);
            expect(res.text).to.include('The Jobs EJS Application');
        });
    });
});
