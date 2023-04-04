/* eslint-disable */

const allowedValues = [
  'body'
]

function existInsideOfItBlock(node) {
  const checkParent = (node) => {
    if (node?.parent?.callee?.name === 'it') return true;
    if (node?.type == 'Program') return false;
    return checkParent(node.parent);
  }
  return checkParent(node);
}

module.exports = {
  meta: {
    messages: {
      enforcePageObjectModel: 'No literal string selectors inside test files.',
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
        // Check if the expression exists inside an it block.
        if (existInsideOfItBlock(node)) {
          context.report({ node: node.parent, messageId: 'enforcePageObjectModel'})
        }
      },
    };
  },
};
