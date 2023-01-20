const axios = require("axios");
const jumbo = require("./jumbo");
const env = require("../util/enviroment");

const slackToken = env.slack.slack_key;
const urlView = "https://slack.com/api/views.open";
const urlMessage = "https://slack.com/api/chat.postMessage";

const channel = env.slack.lunch_id; //lunch
// const channel = env.slack.richards_id //Richard

//Airfryer class with all function for /airfryer in slack
module.exports = class airfryer {
  constructor() {
    console.log("Airfryer is loaded");
  }

  getVoorraad(payload) {
    let values = payload.view.state.values;
    let rndmVal = Object.values(values);
    let snackVoorraad = [];

    rndmVal.forEach((key, index) => {
      if (key.mex !== undefined) {
        snackVoorraad[index] = key.mex.value;
      }
      if (key.fri !== undefined) {
        snackVoorraad[index] = key.fri.value;
      }
      if (key.kro !== undefined) {
        snackVoorraad[index] = key.kro.value;
      }
      if (key.kip !== undefined) {
        snackVoorraad[index] = key.kip.value;
      }
      if (key.kaa !== undefined) {
        snackVoorraad[index] = key.kaa.value;
      }
      if (key.loe !== undefined) {
        snackVoorraad[index] = key.loe.value;
      }
      if (key.bam !== undefined) {
        snackVoorraad[index] = key.bam.value;
      }
      if (
        key.vulSnacks.value !== undefined ||
        key.vulSnacks.value !== false
      ) {
        const order = [];
        if (key.mex.value < 4) order.push("mex");
        if (key.fri.value < 4) order.push("fri");
        if (key.kro.value < 4) order.push("kro");
        if (key.kip.value < 4) order.push("kip");
        if (key.kaa.value < 4) order.push("kaa");
        if (key.loa.value < 4) order.push("loa");
        if (key.bam.value < 4) order.push("bam");
        console.log(order);
        jumbo.vulSnacks(order);
      }
    });

    this.snackMessages(
      snackVoorraad[0],
      snackVoorraad[1],
      snackVoorraad[2],
      snackVoorraad[3],
      snackVoorraad[4],
      snackVoorraad[5],
      snackVoorraad[6]
    );
  }

  async snackMessages(
    vrrdMex,
    vrrdFri,
    vrrdKro,
    vrrdKip,
    vrrdKaa,
    vrrdLoe,
    vrrdBam
  ) {
    await axios.post(
      urlMessage,
      {
        channel: channel,
        text: "Mexicanóóóóóóóóóó _(voorraad: " + vrrdMex + ")_",
      },
      { headers: { authorization: `Bearer ${slackToken}` } }
    );
    await axios.post(
      urlMessage,
      {
        channel: channel,
        text: "Frikandel _(voorraad: " + vrrdFri + ")_",
      },
      { headers: { authorization: `Bearer ${slackToken}` } }
    );
    await axios.post(
      urlMessage,
      {
        channel: channel,
        text: "Kroket _(voorraad: " + vrrdKro + ")_",
      },
      { headers: { authorization: `Bearer ${slackToken}` } }
    );
    await axios.post(
      urlMessage,
      {
        channel: channel,
        text: "Kipcorn _(voorraad: " + vrrdKip + ")_",
      },
      { headers: { authorization: `Bearer ${slackToken}` } }
    );
    await axios.post(
      urlMessage,
      {
        channel: channel,
        text: "Kaassouflé _(voorraad: " + vrrdKaa + ")_",
      },
      { headers: { authorization: `Bearer ${slackToken}` } }
    );
    await axios.post(
      urlMessage,
      {
        channel: channel,
        text: "Loempia _(voorraad: " + vrrdLoe + ")_",
      },
      { headers: { authorization: `Bearer ${slackToken}` } }
    );
    await axios.post(
      urlMessage,
      {
        channel: channel,
        text: "Bamie schijf _(voorraad: " + vrrdBam + ")_",
      },
      { headers: { authorization: `Bearer ${slackToken}` } }
    );
  }

  async postAirfryerModal(req, res) {
    let dialogJson = {
      trigger_id: req.body.trigger_id,
      view: {
        type: "modal",
        title: {
          type: "plain_text",
          text: "Snacks voorraad",
        },
        submit: {
          type: "plain_text",
          text: "Plaats lijst",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Close",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: "Vul de voorraad per snack in.",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "mex",
            },
            label: {
              type: "plain_text",
              text: "Mexicanóóóóóóóóóó",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "fri",
            },
            label: {
              type: "plain_text",
              text: "Frikandel",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "kro",
            },
            label: {
              type: "plain_text",
              text: "Kroket",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "kip",
            },
            label: {
              type: "plain_text",
              text: "Kipcorn",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "kaa",
            },
            label: {
              type: "plain_text",
              text: "Kaassouflé",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "loe",
            },
            label: {
              type: "plain_text",
              text: "Loempia",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "bam",
            },
            label: {
              type: "plain_text",
              text: "Bamie schijf",
              emoji: true,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "checkboxes",
                options: [
                  {
                    text: {
                      type: "mrkdwn",
                      text: "*Vul snacks aan*",
                    },
                    value: "value-0",
                  },
                ],
                action_id: "vulSnacks",
              },
            ],
          },
        ],
      },
    };

    res = await axios.post(urlView, dialogJson, {
      headers: {
        authorization: `Bearer ${slackToken}`,
        "content-type": "application/json",
      },
    });
  }
};
