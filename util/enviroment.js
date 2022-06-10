require('dotenv').config();

console.log(process.env.lunch_id);

module.exports = {
    slack: {
        slack_key: process.env.slack_key,
        lunch_id: process.env.lunch_id,
        richards_id: process.env.richards_id
    },
    port: process.env.port
}