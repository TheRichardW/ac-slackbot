const jumbo = import("jumbo-wrapper");
const axios = require("axios");
const env = require("../util/enviroment");

const slackToken = env.slack.slack_key;
const urlView = "https://slack.com/api/views.open";
const urlMessage = "https://slack.com/api/chat.postMessage";
const urlEphermal = "https://slack.com/api/chat.postEphemeral";

const channel = env.slack.boodschap_id; //boodsschap
// const channel = env.slack.richards_id //Richard

//Jumbo class with all function for /jumbo... in slack
module.exports = class JumboAC {
  constructor() {
    console.log("Jumbo is loaded");
    this.loginJumbo();
  }

  async loginJumbo() {
    this.jumbo = new (await jumbo).Jumbo();
    await this.jumbo.loginWithToken(env.jumbo_key);
  }

  async getMand(req, res) {
    const mand = await this.jumbo?.basket().getMyBasket();

    const latestOrder = await this.jumbo?.order().getMyLatestOrder();
    const orderId = parseInt(latestOrder.order.data.id);
    const fullOrder = await this.jumbo?.order().getMyOrderById(orderId);
    const products = fullOrder.order.data.orderProducts;

    const blocks = await this.createText(mand, products);
    const body = {
      channel: channel,
      text: "Boodschappenlijst",
      blocks: blocks,
    };

    res = await axios.post(urlMessage, body, {
      headers: {
        authorization: `Bearer ${slackToken}`,
        "content-type": "application/json",
      },
    });
  }

  async addToMand(data) {
    if (data.hasOwnProperty("text") && data.channel === channel) {
      const textParts = data.text.trim().split(" ");
      const endOfUrl = textParts[0].indexOf(">");
      const url = textParts[0].substr(1, endOfUrl - 1);

      const isUrl = this.validURL(url);

      if (isUrl && url.includes("jumbo")) {
        const splitUrl = url.split("-");
        const sku = splitUrl[splitUrl.length - 1];
        let quantity = 1;
        if (textParts.length === 0 || textParts.length === 1) {
        } else if (textParts.length > 1 && !isNaN(+textParts[1].trim())) {
          quantity = Math.round(textParts[1].trim());
        } else {
          axios.post(
            urlEphermal,
            {
              channel: channel,
              user: data.user,
              text: "Geen geldig nummer ingevoerd",
            },
            {
              headers: {
                authorization: `Bearer ${slackToken}`,
                "content-type": "application/json",
              },
            }
          );
        }

        const mandje = await this.jumbo?.basket().getMyBasket();
        mandje.products.forEach((product) => {
          if (product.sku == sku) {
            product.quantity = 0;
          }
        });
        mandje.products.push({ sku: sku, quantity: quantity });
        await this.jumbo?.jumboBasket.addToBasket({ items: mandje.products });
        const urlSlash = splitUrl[0].split("/");
        let productName = urlSlash[urlSlash.length - 1] + " ";
        splitUrl.forEach((part, index) => {
          if (index > 0 && index !== splitUrl.length - 1) {
            productName += part + " ";
          }
        });

        await axios.post(
          urlMessage,
          {
            channel: channel,
            text:
              "Er zit nu " + quantity + " keer " + productName + "in de MAND",
          },
          {
            headers: {
              authorization: `Bearer ${slackToken}`,
              "content-type": "application/json",
            },
          }
        );
      }
    }
  }

  createText(mand, products) {
    let blocks = [];
    if (mand.products.length > 0) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*In het winkelmandje: *",
        },
      });
    }

    let mandjeString = "";
    mand.products.forEach((product) => {
      mandjeString +=
        "• " + product.details.title + ", aantal: " + product.quantity + "\n";
    });
    if (mandjeString.length > 0) {
      blocks.push({
        type: "section",
        text: {
          type: "plain_text",
          text: mandjeString,
        },
      });
    } else {
      blocks.push({
        type: "section",
        text: {
          type: "plain_text",
          text: "De winkelmand is leeg",
        },
      });
    }
    if (products.length > 0) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*In de bestelling: *",
        },
      });
    }

    let productString = "";
    products.forEach((product) => {
      productString +=
        "• " +
        product.product.title +
        ", aantal: " +
        product.quantity.amount +
        "\n";
    });
    if (productString.length > 0) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: productString,
        },
      });
    } else {
      blocks.push({
        type: "section",
        text: {
          type: "plain_text",
          text: "De order is leeg",
        },
      });
    }
    return blocks;
  }

  async vulSnacks(order) {
    const products = {
      mex: "225233STK",
      fri: "133602DS",
      kro: "157049STK",
      kip: "225248DS",
      kaa: "167986DS",
      loe: "296449STK",
      bam: "484404DS",
    };
    const mandje = await this.jumbo?.basket().getMyBasket();
    order.forEach((item) => {
      mandje.products.push({ sku: products[item], quantity: 1 });
    });
    await this.jumbo?.jumboBasket.addToBasket({ items: mandje.products });
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
};
