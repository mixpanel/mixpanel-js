const dox = require(`dox`);
const fs = require(`fs`);
const path = require(`path`);


const DOCUMENTED = new Set([
  `MixpanelLib`,
  `MixpanelPeople`,
  `MixpanelGroup`,
]);

function doxToMD(items) {
  console.log(`before`, items.length);
  items = items.filter(item =>
    !item.isPrivate &&
    item.ctx &&
    !item.ctx.name.startsWith(`_`) &&
    DOCUMENTED.has(item.ctx.constructor)
  );
  console.log(`after`, items.length);
  return 'PLACEHOLDER';
}

const rawCode = fs.readFileSync(path.join(__dirname, `mixpanel.js`)).toString().trim();
const parsed = dox.parseComments(rawCode);

console.log(doxToMD(parsed));
