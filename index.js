const express = require('express');
const app = express();
const PORT = process.env.PORT || 2024;

app.get('/', (req, res) => {
    res.send('Bot is running');
});

app.listen(PORT, () => {
    console.log(`[ SYSTEM ] Bot is running on port: ${PORT}`);
});

// THIS PART IS MISSING OR BROKEN IN YOURS
console.log('[ SYSTEM ] Starting bot login...');
try {
    require('./custom.js');
    console.log('[ SYSTEM ] custom.js loaded');
} catch (e) {
    console.error('[ ERROR ] Failed to load custom.js:', e.message);
    console.error(e.stack);
}
