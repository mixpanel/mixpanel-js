import mixpanel from "../../../dist/mixpanel-core.cjs.js";
mixpanel.init(`FAKE_TOKEN`, { flags: true });
mixpanel.init(`FAKE_TOKEN`, {
    flags: {
        context: {
            platform: `web`,
        },
    },
}, `flags2`);
await mixpanel.flags.get_variant(`new-feature`, {
    key: `control`,
    value: `blue`,
});
mixpanel.flags.get_variant_sync(`new-feature`, {
    key: `control`,
    value: `blue`,
});
await mixpanel.flags.update_context({
    company_id: `Y`,
    custom_properties: {
        platform: `mobile`,
    },
});
await mixpanel.flags.get_variant_value(`new-feature`, `blue`);
const color = mixpanel.flags.get_variant_value_sync(`new-feature`, `blue`);
console.log(`Variant color: ${color}`);
await mixpanel.flags.is_enabled(`another-feature`, false);
const isEnabled = mixpanel.flags.is_enabled_sync(`another-feature`);
console.log(`Is another-feature enabled? ${isEnabled}`);
