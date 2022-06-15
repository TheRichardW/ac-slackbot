const express = require('express');
const bodyParser = require('body-parser');
// import { bodyParser }  from 'body-parser';
const lt = require('localtunnel')
// import { localtunnel } from 'localtunnel';

const env = require('./util/enviroment');
const Airfryer = require('./slack-functions/airfryer')
const JumboAC = require('./slack-functions/jumbo');

const app = express(); 
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support url encoded bodies


const port = env.port;
const airfryer = new Airfryer;
const jumbo = new JumboAC;
let tunnel;

app.get('/', (req, res) => {       
    res.sendFile('index.html', {root: __dirname});  
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

//Makes tunnel to https://slack-adcalls.loca.lt
async function createTunnel() {
    tunnel = await lt(port, {subdomain: '/slack-adcalls'}).catch(err => console.log(err));
    console.log('The tunnel to ' + tunnel.url + ' is dug');
}
createTunnel()

//Below are the slack enpoints only add if it is really necessary
app.post('/slack/airfryer', async (req, res) => {
    res.status(200).end();
    airfryer.postAirfryerModal(req, res);
});

app.post('/slack/jumboMand', async (req, res) => {
    res.status(200).end();
    jumbo.getMand(req, res);
});


//Add new events to the switch
app.post('/slack/events', async (req, res) => {
    const event = req.body.event;
    
    if('challenge'in req.body) {
        challenge = req.body.challenge;
        res.status(200).send({challenge: challenge}).end();
    }
    
    if(!event.hasOwnProperty('bot_id')) {
        switch(event.type) {
            case 'message':
                jumbo.addToMand(event);
                res.status(200).end();
                return;
        }
    }
});


//Add new interactions to the switch
app.post('/slack/interactivity', async (req, res) => {
    res.status(200).end();
     
    let payload = JSON.parse(req.body.payload);
    const type = payload.view.type;

    switch(type) {
        case 'modal':
            airfryer.getVoorraad(payload);
            break;
    }
});