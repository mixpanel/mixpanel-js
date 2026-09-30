// Local typedoc plugin encoding this codebase's conventions for the JS classes:
// - a class member is documented only if it has a JSDoc comment, and never if its name starts with `_`
//   (private by convention); typedoc's own `excludeNotDocumented` can't be limited to class members, and
//   the (undocumented) fields of the interfaces in index.d.ts should stay
// - `_`-prefixed parameters are internal and left out of signatures
// - constructors aren't part of the API (instances come from mixpanel.init())
// - methods wrapped in addOptOutCheck*() come out of TypeScript as properties with a function type;
//   they're turned back into methods so they're listed with the other methods
// - top-level functions and variables (the loaders' entry points, and index.d.ts's re-declarations of the
//   class methods as standalone functions) aren't part of this reference
import { Converter, ReflectionKind } from 'typedoc';

export function load(app) {
  app.converter.on(Converter.EVENT_RESOLVE_BEGIN, context => {
    for (const reflection of context.project.getReflectionsByKind(ReflectionKind.Function | ReflectionKind.Variable)) {
      context.project.removeReflection(reflection);
    }
    for (const cls of context.project.getReflectionsByKind(ReflectionKind.Class)) {
      for (const member of [...(cls.children || [])]) {
        if (member.name.startsWith('_') || member.kindOf(ReflectionKind.Constructor) || !hasComment(member)) {
          context.project.removeReflection(member);
        } else if (member.kindOf(ReflectionKind.Property) && member.type && member.type.declaration) {
          const functionType = member.type.declaration;
          member.kind = ReflectionKind.Method;
          member.signatures = functionType.signatures.map(signature => Object.assign(signature, {parent: member, name: member.name}));
          member.type = undefined;
          functionType.signatures = undefined;
          context.project.removeReflection(functionType);
        }
        for (const signature of member.signatures || []) {
          signature.parameters = (signature.parameters || []).filter(parameter => !parameter.name.startsWith('_'));
        }
      }
    }
  });
}

// methods have their comment on the signature; methods wrapped in addOptOutCheck*() are properties
// with a function type, whose comment sits on that type's signature
function hasComment(member) {
  const signatures = member.signatures || (member.type && member.type.declaration && member.type.declaration.signatures) || [];
  return Boolean(member.comment || signatures.some(signature => signature.comment));
}
