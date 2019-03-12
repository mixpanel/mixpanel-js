const dox = require(`dox`);
const fs = require(`fs`);
const {trim} = require(`lodash`);
const path = require(`path`);


const NAMESPACES = {
  MixpanelLib: `mixpanel`,
  MixpanelPeople: `mixpanel.people`,
  MixpanelGroup: `mixpanel.group`,
};

function doxToMD(items) {
  return items
    .filter(item =>
      !item.isPrivate &&
      item.ctx &&
      !item.ctx.name.startsWith(`_`) &&
      !!NAMESPACES[item.ctx.constructor]
    )
    .map(item => ({
      namespace: NAMESPACES[item.ctx.constructor],
      name: item.ctx.name,
      description: item.description.full.replace(`<br />`, ` `),
      arguments: item.tags
        .filter(arg => !!arg.name)
        .map(arg => ({
          name: trim(arg.name, `[]`),
          description: arg.description,
          required: !arg.name.startsWith(`[`),
          types: arg.types.join(` or `),
        })),
    }))
    ;
}

const rawCode = fs.readFileSync(path.join(__dirname, `mixpanel.js`)).toString().trim();
const parsed = dox.parseComments(rawCode);

console.log(doxToMD(parsed));
