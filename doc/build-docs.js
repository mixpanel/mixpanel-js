const dox = require(`dox`);
const fs = require(`fs`);
const {mapValues, template, trim} = require(`lodash`);
const path = require(`path`);


const SOURCE_FILE = path.join(__dirname, `..`, `mixpanel.js`);
const TEMPLATE_FILE = path.join(__dirname, `template.md`);
const OUTPUT_FILE = path.join(__dirname, `readme.io`, `javascript-full-api-reference.md`);

const NAMESPACES = {
  MixpanelLib: `mixpanel`,
  MixpanelPeople: `mixpanel.people`,
  MixpanelGroup: `mixpanel.group`,
};

const DESCRIPTION_REGEXES = {
  description: /([\S\s]+?)(<h3>|$)/,
  usage: /<h3>Usage:<\/h3>([\S\s]+?)(<h3>|$)/,
  notes: /<h3>Notes:<\/h3>([\S\s]+?)(<h3>|$)/,
};

function parseDescriptionAttrs(html) {
  return mapValues(DESCRIPTION_REGEXES, regex => {
    const match = html.match(regex);
    return match && match[1]
      .trim()
      .replace(/<br \/>/g, ` `)
      .replace(/<p>([\S\s]+?)<\/?p>/g, `$1`)
      .replace(/<pre><code>([\s\S]+?)<\/code><\/pre>/g, '\n```javascript\n$1\n```')
      ;
  });
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
              description: arg.description.replace(/<p>([\S\s]+?)<\/?p>/g, `$1`),
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
