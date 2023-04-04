/* eslint-disable */

const allowedCyChainables = [
  'contains',
  'filter',
  'find',
  'focused',
  'get',
]

const allowedValues = [
  'body',
  'html'
]

module.exports = {
  meta: {
    messages: {
      tooSimple: 'No generic selectors.',
    },
  },
  create(context) {
    return {
      MemberExpression(node) {
        const namespace = node?.object?.name;
        const method = node?.property?.name;
        const argument = node?.parent?.arguments?.[0];

        // Guards
        if (namespace !== 'cy') return;
        if (method !== 'get') return;
        if (argument === null || argument.type !== 'Literal') return;
        if (allowedValues.includes(argument.value)) return;

        // Check if it's basic.
        const alphaNumberic = new RegExp(/^[a-z0-9]+$/i)
        if (alphaNumberic.test(argument.value)) {
        
          // Check if the next chained method is in the allowed list.
          const chainedNode = node?.parent?.parent?.property?.name;
          if (allowedCyChainables.includes(chainedNode)) return;
          context.report({ node: node.parent, messageId: 'tooSimple'})
        }
      },
    };
  },
};
