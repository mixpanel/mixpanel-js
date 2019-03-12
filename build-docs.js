const dox = require(`dox`);
const fs = require(`fs`);
const path = require(`path`);


const rawCode = fs.readFileSync(path.join(__dirname, `mixpanel.js`)).toString().trim();
const parsed = dox.parseComments(rawCode);

console.log(parsed);
