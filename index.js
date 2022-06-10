const express = require('express'); //Import the express dependency
const app = express(); 
const lt = require('localtunnel');
const axios = require('axios');
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3003;
let tunnel;


const slackToken = 'xoxb-40070228839-3637752507747-icwwoahmY7QNtHFoS05sEztQ';
const urlView = 'https://slack.com/api/views.open';
const urlMessage = 'https://slack.com/api/chat.postMessage';

// const channel = 'C02U01ELJBA' //lunch
const channel = 'U0314MUDEM8' //Richard

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});

async function createTunnel() {
    tunnel = await lt(port,{subdomain: '/adcalls'}).catch(err => console.log(err))
    console.log('The tunnel url is ' + tunnel.url)
}

createTunnel()

app.post('/slack/airfryer', async (req, res) => {
    res.status(200).send({ 'text': 'processing'}).end();

    let dialogJson = {
        trigger_id: req.body.trigger_id,
        view: {
            type:'modal',
            title: {
                type: 'plain_text',
                text: 'Snacks voorraad'
            },
            submit: {
                type: 'plain_text',
                text: 'Plaats lijst',
                emoji: true
            },
            close: {
                type: 'plain_text',
                text: 'Close',
                emoji: true
            },
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'plain_text',
                        text: 'Vul de voorraad per snack in.',
                        emoji: true
                    }
                },
                {
                    type: 'input',
                    element: {
                        type: 'plain_text_input',
                        action_id: 'mex'
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Mexicanóóóóóóóóóó',
                        emoji: true
                    }
                },
                {
                    type: 'input',
                    element: {
                        type: 'plain_text_input',
                        action_id: 'fri'
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Frikandel',
                        emoji: true
                    }
                },
                {
                    type: 'input',
                    element: {
                        type: 'plain_text_input',
                        action_id: 'kro'
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Kroket',
                        emoji: true
                    }
                },
                {
                    type: 'input',
                    element: {
                        type: 'plain_text_input',
                        action_id: 'kip'
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Kipcorn',
                        emoji: true
                    }
                },
                {
                    type: 'input',
                    element: {
                        type: 'plain_text_input',
                        action_id: 'kaa'
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Kaassouflé',
                        emoji: true
                    }
                }
            ]
        }
    }

    res = await axios.post(urlView, 
        dialogJson
      , { headers: { authorization: `Bearer ${slackToken}`, 'content-type': 'application/json' } });
});

app.post('/slack/interactivity', async (req, res) => {
    res.status(200).end()
    
    let payload = JSON.parse(req.body.payload);
    let values = payload.view.state.values
    let rndmVal = Object.values(values);
    let snackVoorraad = [] 

    rndmVal.forEach((key, index) => {
        if(key.mex !== undefined){
            snackVoorraad[index] = key.mex.value
        }
        if(key.fri !== undefined){
            snackVoorraad[index] = key.fri.value
        }
        if(key.kro !== undefined){
            snackVoorraad[index] = key.kro.value
        }
        if(key.kip !== undefined){
            snackVoorraad[index] = key.kip.value
        }
        if(key.kaa !== undefined){
            snackVoorraad[index] = key.kaa.value
        }

    });

    snackMessages(snackVoorraad[0],snackVoorraad[1],snackVoorraad[2],snackVoorraad[3],snackVoorraad[4])
})

async function snackMessages(vrrdMex, vrrdFri, vrrdKro, vrrdKip, vrrdKaa) {
    await axios.post(urlMessage, {
        channel: channel,
        text: 'Mexicanóóóóóóóóóó (' + vrrdMex + ')'
      }, { headers: { authorization: `Bearer ${slackToken}` } });
    await axios.post(urlMessage, {
      channel: channel,
      text: 'Frikandel (' + vrrdFri + ')'
    }, { headers: { authorization: `Bearer ${slackToken}` } });
    await axios.post(urlMessage, {
        channel: channel,
        text: 'Kroket (' + vrrdKro + ')'
      }, { headers: { authorization: `Bearer ${slackToken}` } });
    await axios.post(urlMessage, {
        channel: channel,
        text: 'Kipcorn (' + vrrdKip + ')'
      }, { headers: { authorization: `Bearer ${slackToken}` } });
      await axios.post(urlMessage, {
        channel: channel,
        text: 'Kaassouflé (' + vrrdKaa + ')'
      }, { headers: { authorization: `Bearer ${slackToken}` } });   
}