module.exports.config = {
    name: "prefix",
    version: "1.0",
    hasPermssion: 0,
    credits: "Ashiro",
    description: "Show prefix",
    commandCategory: "system",
    usages: "",
    cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event, Users, prefix }) {
    const { threadID, messageID, body, senderID } = event;
    if (body && body.toLowerCase() === "prefix") {
        const name = await Users.getNameUser(senderID);
        const globalPrefix = global.config.PREFIX;
        return api.sendMessage(`👋 Hey ${name}, did you ask for my prefix?\n➥ 🌐 Global: ${globalPrefix}\n➥ 💬 This Chat: ${prefix}\nI'm Ashiro Bot at your service 🫡`, threadID, messageID);
    }
};

module.exports.run = async function ({ api, event, Users, prefix }) {
    const { threadID, messageID, senderID } = event;
    const name = await Users.getNameUser(senderID);
    const globalPrefix = global.config.PREFIX;
    return api.sendMessage(`👋 Hey ${name}, did you ask for my prefix?\n➥ 🌐 Global: ${globalPrefix}\n➥ 💬 This Chat: ${prefix}\nI'm Ashiro Bot at your service 🫡`, threadID, messageID);
};
