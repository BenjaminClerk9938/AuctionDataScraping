const fs = require('fs');

function saveToJSON(filename, data) {
    const filePath = `./logs/${filename}`;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${filePath}`);
}

module.exports = saveToJSON;
