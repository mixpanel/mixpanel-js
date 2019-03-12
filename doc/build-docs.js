const dox = require(`dox`);
const fs = require(`fs`);
const {template, trim} = require(`lodash`);
const path = require(`path`);

const SOURCE_FILE = path.join(__dirname, `..`, `mixpanel.js`);
const TEMPLATE_FILE = path.join(__dirname, `template.md`);
const OUTPUT_FILE = path.join(__dirname, `api-reference.md`);

const NAMESPACES = {
  MixpanelLib: `mixpanel`,
  MixpanelPeople: `mixpanel.people`,
  MixpanelGroup: `mixpanel.group`,
};

function doxToMD(items) {
  const renderMD = template(fs.readFileSync(TEMPLATE_FILE).toString());
  return renderMD({
    namespaces: Object.entries(NAMESPACES).map(([constructor, namespace]) => ({
      name: namespace,
      items: items
        .filter(item =>
          !item.isPrivate &&
          item.ctx &&
          !item.ctx.name.startsWith(`_`) &&
          item.ctx.constructor === constructor
        )
        .map(item => ({
          name: `${namespace}.${item.ctx.name}`,
          description: item.description.full.replace(`<br />`, ` `),
          arguments: item.tags
            .filter(arg => !!arg.name)
            .map(arg => ({
              name: trim(arg.name, `[]`),
              description: arg.description,
              required: !arg.name.startsWith(`[`),
              types: arg.types.join(` or `),
            })),
        })),
    })),
  });
}

const rawCode = fs.readFileSync(SOURCE_FILE).toString().trim();
const parsed = dox.parseComments(rawCode);

fs.writeFileSync(OUTPUT_FILE, doxToMD(parsed));
console.log(`Wrote docs to ${OUTPUT_FILE}`);
