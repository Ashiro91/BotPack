const { exec } = require("child_process");
const chalk = require("chalk");
const check = require("get-latest-version");
const fs = require("fs");
const semver = require("semver");
const path = require("path");
const express = require("express");
const parser = require("body-parser");

global.loading = require("./utils/log.js");
let configJson;
let packageJson;

const sign = "(›^-^)›";
const fbstate = "appstate.json";

try {
    configJson = require("./config.json");
} catch (error) {
    console.error("Error loading config.json:", error);
    process.exit(1);
}

// --- Remove Appstate if removeSt = true ---
const delayedLog = async (message) => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (const char of message) {
        process.stdout.write(char);
        await delay(50);
    }
    console.log();
};

const showMessage = async () => {
    const message = chalk.yellow(" ") + `The "removeSt" property is set true in the config.json. Therefore, the Appstate was cleared!`;
    await delayedLog(message);
};

if (configJson.removeSt) {
    fs.writeFileSync(fbstate, sign, { encoding: "utf8", flag: "w" });
    showMessage();
    configJson.removeSt = false;
    fs.writeFileSync("./config.json", JSON.stringify(configJson, null, 2), "utf8");
    console.log(chalk.red("Appstate cleared. Please add new appstate.json then restart."));
    setTimeout(() => { process.exit(0); }, 5000);
    return;
}

// --- Auto Update Packages ---
const excluded = configJson.UPDATE.EXCLUDED || [];

try {
    packageJson = require("./package.json");
} catch (error) {
    console.error("Error loading package.json:", error);
}

function nv(version) {
    return version.replace(/^\^/, "");
}

async function updatePackage(dependency, currentVersion, latestVersion) {
    if (!excluded.includes(dependency)) {
        const ncv = nv(currentVersion);
        if (semver.neq(ncv, latestVersion)) {
            console.log(chalk.bgYellow.bold(` UPDATE `), `New version ${chalk.yellow(`^${latestVersion}`)} for ${chalk.yellow(dependency)}. Updating...`);
            packageJson.dependencies[dependency] = `^${latestVersion}`;
            fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));
            console.log(chalk.green.bold(`UPDATED`), `${chalk.yellow(dependency)} updated to ^${latestVersion}`);
            exec(`npm install ${dependency}@latest`);
        }
    }
}

async function checkAndUpdate() {
    if (configJson.UPDATE && configJson.UPDATE.Package) {
        try {
            for (const [dependency, currentVersion] of Object.entries(packageJson.dependencies)) {
                const latestVersion = await check(dependency);
                await updatePackage(dependency, currentVersion, latestVersion);
            }
        } catch (error) {
            console.error("Error checking dependencies:", error);
        }
    } else {
        console.log(chalk.yellow(""), "Package auto-update disabled in config.json");
    }
}

setTimeout(() => { checkAndUpdate(); }, 20000);

// --- Express Server for Uptime ---
const app = express();
app.use(parser.json());
app.use(express.static(path.join(__dirname, "includes/cover")));

app.get("/themes", (req, res) => {
    res.sendFile(path.join(__dirname, "includes/cover/html.json"));
});

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "includes/cover/index.html"));
});

app.listen(2024, () => {
    global.loading.log(`Bot is running on port: 2024`, "SYSTEM");
});

// --- THIS IS THE IMPORTANT PART YOU'RE MISSING ---
// Start the actual bot
setTimeout(() => {
    try {
        require("./custom.js"); // This starts your bot login + commands
    } catch (e) {
        console.error("Failed to start custom.js:", e);
        // Try main.js as backup
        try {
            require("./main.js");
        } catch (e2) {
            console.error("Failed to start main.js:", e2);
            process.exit(1);
        }
    }
}, 3000); // Wait 3s for express to start first
