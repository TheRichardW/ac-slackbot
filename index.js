const express = require('express');
const app = express(); 
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support url encoded bodies
const lt = require('localtunnel');
const bodyParser = require('body-parser');
const Airfryer = require('./slack-functions/airfryer')
const env = require('./util/enviroment');


const port = env.port;
const airfryer = new Airfryer;
let tunnel;

app.get('/', (req, res) => {       
    res.sendFile('index.html', {root: __dirname});  
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

//Makes tunnel to https://adcalls.loca.lt
async function createTunnel() {
    tunnel = await lt(port,{subdomain: '/adcalls'}).catch(err => console.log(err));
    console.log('The tunnel to ' + tunnel.url + ' is dug');
}
createTunnel()

//Below are the slack enpoints only add if it is really necessary
app.post('/slack/airfryer', async (req, res) => {
    res.status(200).end();
    airfryer.postAirfryerModal(req, res);
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
    })