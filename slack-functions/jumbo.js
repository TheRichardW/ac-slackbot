const testjumbo = import("jumbo-wrapper");
const axios = require('axios');
const env = require('../util/enviroment');

const slackToken = env.slack.slack_key;
const urlView = 'https://slack.com/api/views.open';
const urlMessage = 'https://slack.com/api/chat.postMessage';

// const channel = env.slack.lunch_id //lunch
const channel = env.slack.richards_id //Richard

let jumbo;
//Jumbo class with all function for /jumbo... in slack
module.exports = class JumboAC {
    
    constructor() {
        this.loginJumbo();
    }
    
    async loginJumbo() {
        this.jumbo = new (await testjumbo).Jumbo();
        await this.jumbo.loginWithToken(env.jumbo_key)
    }

    async getMand(req, res) {
        // console.log(req)
        const mand = await this.jumbo?.basket().getMyBasket({store_id:3520});
        const blocks = await this.createText(mand);
        console.log(blocks);
        const body = {
            channel: channel,
            text: 'Boodschappenlijst is leeg',
            blocks: blocks
        }

        res = await axios.post(urlMessage,
            body,
            { headers: 
                { authorization: `Bearer ${slackToken}`, 'content-type': 'application/json' }
            });
    }

    async addToMand(data) {
        const textParts = data.text.split(' ');
        console.log(channel);
        const endOfUrl = textParts[0].indexOf('>');
        const url = textParts[0].substr(1,endOfUrl-1);

        const isUrl = this.validURL(url);
        console.log(data);
        console.log(data.bot_id);
        console.log(data.user);
        console.log(data.hasOwnProperty('bot_id'));

        if (isUrl && !data.hasOwnProperty('bot_id') && url.includes('jumbo')) {
            const splitUrl = url.split('-');
            const sku = splitUrl[splitUrl.length-1]
            if(textParts > 0){
                await this.jumbo?.basket().addToBasket({items:[{sku: sku, quantity: textParts[1]}]})
            } else {
                await this.jumbo?.basket().addToBasket({items:[{sku: sku, quantity: 1}]})
            }
            let res = await axios.post(urlMessage,
                {
                    channel: channel,
                    text: 'Dit is een geldige jumbo url',
                },
                { headers: 
                    { authorization: `Bearer ${slackToken}`, 'content-type': 'application/json' }
                });
        } else {
            console.log('false');
            return;
            res = await axios.post(urlMessage,{
                    channel: channel,
                    text: 'Dit is geen geldige jumbo url',
                },
                { headers: 
                    { authorization: `Bearer ${slackToken}`, 'content-type': 'application/json' }
                }
            );
        }

    }


    createText(mand){
        let blocks = [];
        if (mand.products>0){
            blocks.push({
                type: 'section',
                text: {
                    type: 'plain_text',
                    text: 'Boodschappenlijst',
                    emoji: true
                }
            },)
        }
        mand.products.forEach(product => {
            blocks.push({
                type: 'section',
                text: {
                    type: 'plain_text',
                    text: product.details.title + ', aantal: ' + product.quantity,
                    emoji: true
                }
            },
            );
        });
        return blocks;
    }


    validURL(str) {
        let url;

        try {
            url = new URL(str);
            console.log(url);
        } catch (_) {
            return false;  
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }   
}


