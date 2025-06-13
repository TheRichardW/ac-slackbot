const axios = require("axios");
const env = require("../util/enviroment");

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

  snacksArr = [
    { key: "mex", name: "Mexicaantje", icon: "mexicano" },
    { key: "fri", name: "Frikandel", icon: "frikandel" },
    { key: "kro", name: "Kroket", icon: "kroket" },
    { key: "kipc", name: "Kipcorn", icon: "kipcorn" },
    { key: "kips", name: "Crispy chicken spicy", icon: "crispy_chick_spicy" },
    { key: "kaa", name: "Kaassouflé", icon: "kaassoufle" },
    { key: "cbi", name: "Chicken bites", icon: "chicken_bites" },
    { key: "bam", name: "Bamischijf", icon: "bami_schijf" },
  ];

  getVoorraad(payload) {
    let values = payload.view.state.values;
    let formAnswers = Object.values(values);

    this.snacksArr.forEach(async (snack, index) => {
      const formAnswer = formAnswers.find(
        (fA) => Object.keys(fA)[0] === snack.key
      );
      const amount = formAnswer[snack.key].value;
      if (amount > 0) {
        this.sendMessage(snack, amount);
      }
    });

    const formAnswerTtlExt1 = formAnswers.find(
      (fA) => Object.keys(fA)[0] === 'ttlext1'
    );
    const formAnswerExt1 = formAnswers.find(
      (fA) => Object.keys(fA)[0] === 'ext1'
    );

    if (
      formAnswerTtlExt1["ttlext1"].value !== undefined &&
      formAnswerExt1["ext1"].value !== undefined &&
      parseInt(formAnswerExt1["ext1"].value) > 0
    ) {
      this.sendMessage(
        { name: formAnswerTtlExt1["ttlext1"].value, icon: "" },
        parseInt(formAnswerExt1["ext1"].value)
      );
    }

    const formAnswerTtlExt2 = formAnswers.find(
      (fA) => Object.keys(fA)[0] === 'ttlext2'
    );
    const formAnswerExt2 = formAnswers.find(
      (fA) => Object.keys(fA)[0] === 'ext2'
    );

    if (
      formAnswerTtlExt2["ttlext2"]?.value !== undefined &&
      formAnswerExt2["ext2"]?.value !== undefined &&
      parseInt(formAnswerExt2["ext2"]?.value) > 0
    ) {
      this.sendMessage(
        { name: formAnswerTtlExt2["ttlext2"].value, icon: null },
        parseInt(formAnswerExt2["ext2"].value)
      );
    }
  }

  async sendMessage(snack, amount) {
    const icon = snack?.icon ? `:${snack.icon}: ` : '';
    await axios.post(
      urlMessage,
      {
        channel: channel,
        ts: Date.now(), // For ordering messages
        text: `${icon}${snack.name} _(voorraad: ${amount})_`,
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
          ...this.createSnacksJson(),
          {
            type: "divider",
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

  createSnacksJson() {
    const snackJson = [];
    this.snacksArr.forEach((snack) => {
      snackJson.push({
        type: "input",
        element: {
          type: "number_input",
          is_decimal_allowed: false,
          action_id: snack.key,
        },
        label: {
          type: "plain_text",
          text: snack.name,
          emoji: true,
        },
      });
    });

    return snackJson;
  }
};
