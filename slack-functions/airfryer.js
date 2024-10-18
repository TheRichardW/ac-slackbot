const axios = require("axios");
const jumbo = require("./jumbo");
const env = require("../util/enviroment");
const { Jumbo } = require("jumbo-wrapper");

const slackToken = env.slack.slack_key;
const urlView = "https://slack.com/api/views.open";
const urlMessage = "https://slack.com/api/chat.postMessage";

const channel = env.slack.lunch_id; //lunch
// const channel = env.slack.richards_id; //Richard

//Airfryer class with all function for /airfryer in slack
module.exports = class airfryer {
  constructor() {
    console.log("Airfryer is loaded");
  }

  getVoorraad(payload) {
    let values = payload.view.state.values;
    let rndmVal = Object.values(values);
    let snackVoorraad = [];
    let order = [];

    rndmVal.forEach((key, index) => {
      if (key.mex !== undefined) {
        if (key.mex.value < 4) order.push("mex");
        snackVoorraad[index] = parseInt(key.mex.value);
      }
      if (key.fri !== undefined) {
        if (key.fri.value < 4) order.push("fri");
        snackVoorraad[index] = parseInt(key.fri.value);
      }
      if (key.kro !== undefined) {
        if (key.kro.value < 4) order.push("kro");
        snackVoorraad[index] = parseInt(key.kro.value);
      }
      if (key.kipn !== undefined) {
        if (key.kipn.value < 4) order.push("kipn");
        snackVoorraad[index] = parseInt(key.kipn.value);
      }
      if (key.kips !== undefined) {
        if (key.kips.value < 4) order.push("kips");
        snackVoorraad[index] = parseInt(key.kips.value);
      }
      if (key.kaa !== undefined) {
        if (key.kaa.value < 4) order.push("kaa");
        snackVoorraad[index] = parseInt(key.kaa.value);
      }
      if (key.vulSnacks?.selected_options[0]?.value === "vulAan") {
        new jumbo().vulSnacks(order);
      }
      if (key.ttlext1 !== undefined) {
        snackVoorraad[index] = key.ttlext1.value;
      }
      if (key.ext1 !== undefined) {
        snackVoorraad[index] = parseInt(key.ext1.value);
      }
      if (key.ttlext2 !== undefined) {
        snackVoorraad[index] = key.ttlext2.value;
      }
      if (key.ext2 !== undefined) {
        snackVoorraad[index] = parseInt(key.ext2.value);
      }
    });

    this.snackMessages(
      snackVoorraad[0],
      snackVoorraad[1],
      snackVoorraad[2],
      snackVoorraad[3],
      snackVoorraad[4],
      snackVoorraad[5],
      snackVoorraad[6],
      snackVoorraad[7],
      snackVoorraad[8],
      snackVoorraad[9],
      snackVoorraad[10],
      snackVoorraad[11]
    );
  }

  async snackMessages(
    vrrdMex,
    vrrdFri,
    vrrdKro,
    vrrdKipn,
    vrrdKips,
    vrrdKaas,
    snackVoorraad,
    vrrdTtlext1,
    vrrdext1,
    vrrdTtlext2,
    vrrdext2
  ) {
    if (vrrdMex > 0)
      await axios.post(
        urlMessage,
        {
          channel: channel,
          text: ":mexicano: Mexicaantje _(voorraad: " + vrrdMex + ")_",
        },
        { headers: { authorization: `Bearer ${slackToken}` } }
      );
    if (vrrdFri > 0)
      await axios.post(
        urlMessage,
        {
          channel: channel,
          text: ":frikandel: Frikandel _(voorraad: " + vrrdFri + ")_",
        },
        { headers: { authorization: `Bearer ${slackToken}` } }
      );
    if (vrrdKro > 0)
      await axios.post(
        urlMessage,
        {
          channel: channel,
          text: ":kroket: Kroket _(voorraad: " + vrrdKro + ")_",
        },
        { headers: { authorization: `Bearer ${slackToken}` } }
      );
    if (vrrdKipn > 0)
      await axios.post(
        urlMessage,
        {
          channel: channel,
          text: ":crispy_chick: Cripsy chicken _(voorraad: " + vrrdKipn + ")_",
        },
        { headers: { authorization: `Bearer ${slackToken}` } }
      );
    if (vrrdKips > 0)
      await axios.post(
        urlMessage,
        {
          channel: channel,
          text: ":crispy_chick_spicy: Cripsy chicken spicy _(voorraad: " + vrrdKips + ")_",
        },
        { headers: { authorization: `Bearer ${slackToken}` } }
      );
    if (vrrdKaa > 0)
      await axios.post(
        urlMessage,
        {
          channel: channel,
          text: ":kaassoufle: Kaassouflé _(voorraad: " + vrrdKaas + ")_",
        },
        { headers: { authorization: `Bearer ${slackToken}` } }
      );
    if (vrrdext1 > 0)
      await axios.post(
        urlMessage,
        {
          channel: channel,
          text: vrrdTtlext1 + " _(voorraad: " + vrrdext1 + ")_",
        },
        { headers: { authorization: `Bearer ${slackToken}` } }
      );
    if (vrrdext2 > 0)
      await axios.post(
        urlMessage,
        {
          channel: channel,
          text: vrrdTtlext2 + " _(voorraad: " + vrrdext2 + ")_",
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
              type: "number_input",
              is_decimal_allowed: false,
              action_id: "mex",
            },
            label: {
              type: "plain_text",
              text: "Mexicaantje",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "number_input",
              is_decimal_allowed: false,
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
              type: "number_input",
              is_decimal_allowed: false,
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
              type: "number_input",
              is_decimal_allowed: false,
              action_id: "kipn",
            },
            label: {
              type: "plain_text",
              text: "Cripsy chicken normaal",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "number_input",
              is_decimal_allowed: false,
              action_id: "kips",
            },
            label: {
              type: "plain_text",
              text: "Cripsy chicken spicy",
              emoji: true,
            },
          },
          {
            type: "input",
            element: {
              type: "number_input",
              is_decimal_allowed: false,
              action_id: "kaa",
            },
            label: {
              type: "plain_text",
              text: "Kaassouflé",
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
                    value: "vulAan",
                  },
                ],
                action_id: "vulSnacks",
              },
            ],
          },
          {
            type: "input",
            optional: true,
            element: {
              type: "plain_text_input",
              action_id: "ttlext1",
            },
            label: {
              type: "plain_text",
              text: "Titel Extra 1",
              emoji: true,
            },
          },
          {
            type: "input",
            optional: true,
            element: {
              type: "number_input",
              is_decimal_allowed: false,
              action_id: "ext1",
            },
            label: {
              type: "plain_text",
              text: "Extra 1",
              emoji: true,
            },
          },
          {
            type: "input",
            optional: true,
            element: {
              type: "plain_text_input",
              action_id: "ttlext2",
            },
            label: {
              type: "plain_text",
              text: "Titel Extra 2",
              emoji: true,
            },
          },
          {
            type: "input",
            optional: true,
            element: {
              type: "number_input",
              is_decimal_allowed: false,
              action_id: "ext2",
            },
            label: {
              type: "plain_text",
              text: "Extra 2",
              emoji: true,
            },
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
