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

function parseDescriptionAttrs(html) {
  const [description, usage, _unused, notes] = html
    .replace(/<br \/>/g, ` `)
    .split(/<h3>Usage:<\/h3>[\s\S]*<code>([\s\S]+)<\/code><\/pre>([\s\S]*<h3>Notes:<\/h3>)?/)
    .map(s => s && s.trim());
  return {description, usage, notes};
}

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
          arguments: item.tags
            .filter(arg => !!arg.name)
            .map(arg => ({
              name: trim(arg.name, `[]`),
              description: arg.description,
              required: !arg.name.startsWith(`[`),
              types: arg.types.join(` or `),
            })),
          ...parseDescriptionAttrs(item.description.full),
        })),
    })),
  });
}

const rawCode = fs.readFileSync(SOURCE_FILE).toString().trim();
const parsed = dox.parseComments(rawCode);

fs.writeFileSync(OUTPUT_FILE, doxToMD(parsed));
console.log(`Wrote docs to ${OUTPUT_FILE}`);
