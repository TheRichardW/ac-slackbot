const axios = require('axios');
const env = require('../util/enviroment');

const slackToken = env.slack.slack_key;
const urlView = 'https://slack.com/api/views.open';
const urlMessage = 'https://slack.com/api/chat.postMessage';

// const channel = env.slack.lunch_id //lunch
const channel = env.slack.richards_id //Richard

//Airfryer class with all function for /airfryer in slack
module.exports = class airfryer {
    constructor(){
        console.log('Airfryer is loaded')
    }

    getVoorraad(payload) {
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

        this.snackMessages(snackVoorraad[0],snackVoorraad[1],snackVoorraad[2],snackVoorraad[3],snackVoorraad[4])
    }

    async snackMessages(vrrdMex, vrrdFri, vrrdKro, vrrdKip, vrrdKaa) {
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


    async postAirfryerModal(req, res) {
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
          , { headers: { authorization: `Bearer ${slackToken}`, 'content-type': 'application/json' } 
        });
    }
}