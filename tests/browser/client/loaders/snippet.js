import { ALL_TESTS } from "..";
import { testMixpanel } from "../runTests";

mocha.setup(`bdd`);

testMixpanel(window.mixpanel, ALL_TESTS);
