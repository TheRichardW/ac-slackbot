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
        console.log('Jumbo is loaded')
        this.loginJumbo();
    }
    
    async loginJumbo() {
        this.jumbo = new (await testjumbo).Jumbo();
        await this.jumbo.loginWithToken(env.jumbo_key)
    }

    async getMand(req, res) {
        const mand = await this.jumbo?.basket().getMyBasket({store_id:3520});
        const blocks = await this.createText(mand);
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
        const endOfUrl = textParts[0].indexOf('>');
        const url = textParts[0].substr(1,endOfUrl-1);

        const isUrl = this.validURL(url);
  
        if (isUrl) {
            if (!data.hasOwnProperty('bot_id') || url.includes('jumbo')) {
                const splitUrl = url.split('-');
                const sku = splitUrl[splitUrl.length-1]

                let quantity = 1;
                if(textParts.length > 1){
                    quantity = textParts[1].trim();
                }
                
                const mandje = await this.jumbo?.basket().getMyBasket({store_id:3520});

                mandje.products.forEach((product, index) => {
                    if(product.sku == sku) {
                        product.quantity = 0
                    }
                })

                mandje.products.push({sku: sku, quantity: quantity})

                await this.jumbo?.jumboBasket.addToBasket({items:mandje.products});
                const urlSlash = splitUrl[0].split('/');
                let productName = urlSlash[urlSlash.length-1] + ' ';
                splitUrl.forEach((part, index) => {
                    if(index > 0 && index !== splitUrl.length-1) {
                        productName += part + ' ';
                    }
                })
                
                await axios.post(urlMessage,
                    {
                        channel: channel,
                        text: 'Er zit nu ' + quantity + ' keer ' + productName + 'in de MAND' ,
                    },
                    { headers: 
                        { authorization: `Bearer ${slackToken}`, 'content-type': 'application/json' }
                    });
            }
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
        } catch (_) {
            return false;  
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }   
}


