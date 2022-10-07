require("dotenv").config();

module.exports = {
  slack: {
    slack_key: process.env.slack_key,
    lunch_id: process.env.lunch_id,
    boodschap_id: process.env.boodschap_id,
    richards_id: process.env.richards_id,
  },
  jumbo_key: process.env.jumbo_key,
  port: process.env.port,
};
