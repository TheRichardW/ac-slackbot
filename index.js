const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const env = require("./util/enviroment");
const Airfryer = require("./slack-functions/airfryer");
const JumboAC = require("./slack-functions/jumbo");
const { json } = require("express");

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support url encoded bodies

const port = env.port;
const airfryer = new Airfryer();
const jumbo = new JumboAC();
let tunnel;

const slackToken = env.slack.slack_key;
const urlView = "https://slack.com/api/views.open";

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});

//Below are the slack enpoints only add if it is really necessary
app.post("/slack/airfryer", async (req, res) => {
  res.status(200).end();
  airfryer.postAirfryerModal(req, res);
});

app.post("/slack/jumboMand", async (req, res) => {
  res.status(200).end();
  jumbo.getMand(req, res);
});

//Add new events to the switch
app.post("/slack/events", async (req, res) => {
  const event = req.body.event;

  if ("challenge" in req.body) {
    challenge = req.body.challenge;
    res.status(200).send({ challenge: challenge }).end();
  }

  if (!event.hasOwnProperty("bot_id") || event.username == "Jumbo Mand") {
    switch (event.type) {
      case "message":
        whatMessage(event);
        res.status(200).end();
        return;
      case "workflow_step_execute":
        jumbo.getMand("", "");
        res.status(200).end();
    }
  }
});

//Add new interactions to the switch
app.post("/slack/interactivity", async (req, res) => {
  let payload = JSON.parse(req.body.payload);

  let type = payload.type;
  if (type == undefined) {
    type = payload.view.type;
  }

  switch (type) {
    case "modal":
      res.status(200).end();
      airfryer.getVoorraad(payload);
      break;
    case "workflow_step_edit":
      res.status(200).end();
      sendWorkflow(payload, res);
      return;
    case "view_submission":
      res.status(200).end();
      if (payload.view.title.text == "Snacks voorraad") {
        airfryer.getVoorraad(payload);
        return;
      }
      response = await axios.post(
        "https://slack.com/api/workflows.updateStep",
        { workflow_step_edit_id: payload.workflow_step.workflow_step_edit_id },
        {
          headers: {
            authorization: `Bearer ${slackToken}`,
            "content-type": "application/json",
          },
        }
      );
      break;
  }
});

function whatMessage(event) {
  switch (event.text) {
    case "{{/jumbomand}}":
      jumbo.getMand("", "");
    default:
      jumbo.addToMand(event);
  }
}

async function sendWorkflow(payload, res) {
  workflowModalJson = {
    trigger_id: payload.trigger_id,
    view: {
      blocks: [
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "Hallo",
            emoji: true,
          },
        },
        {
          type: "input",
          element: {
            type: "plain_text_input",
            action_id: "plain_text_input-action",
          },
          label: {
            type: "plain_text",
            text: "Label",
            emoji: true,
          },
        },
      ],
      type: "workflow_step",
    },
  };

  res = await axios.post(urlView, workflowModalJson, {
    headers: {
      authorization: `Bearer ${slackToken}`,
      "content-type": "application/json",
    },
  });
}
