/* eslint-disable */

Object.isObject = function (item) {
  return (typeof item === 'object' && !Array.isArray(item) && item !== null)
}

function matchesProperty(item, condition) {
  return (Object.prototype.hasOwnProperty.call(item, 'type') && item.type === condition);
}

function findDeep(object) {
  const list = [];
  
  /**
   * Arrays
   */
  if (Array.isArray(object)) {
    for (const element of object) {
      list.push(...findDeep(element));
    }
  }

  /**
   * Objects
   */
  if (Object.isObject(object)) {
    if (matchesProperty(object, 'ReturnStatement')) {
      list.push(object);
    } else {
      Object.entries(object).forEach(entry => {
        const [ key, value ] = entry;
        if (key !== 'parent' && Object.isObject(value)) {
          list.push(...findDeep(value))
        } 
        if (key !== 'parent' && Array.isArray(value)) {
          list.push(...findDeep(value))
        }
      })
    }
  }

  return list;
}

function getReturnStatements(method) {
  const blockStatementBodyArray = method?.value?.body?.body;
  if (!blockStatementBodyArray) return null;
  const array = findDeep(blockStatementBodyArray);
  return array;
}

function summarizeMemberExpression(memberExpression) {
  if (memberExpression?.type === 'MemberExpression') {
    return 'IGNORE_ME'; // Todo: Stringify the member expressions.
  }
  return null;
}

function getFinalCallee(returnStatement) {
  let finalCallee = returnStatement?.argument?.callee;
  if (returnStatement?.argument?.object?.type === 'ThisExpression') return null;
  if (typeof finalCallee === 'undefined') return null; 
  if (finalCallee.type === 'Identifier') return null;
  const maxRecursion = 50;

  // Iterate through objects and callees
  for (let i = 0; i < maxRecursion; i += 1) {
  
  // If it's final.
    if (finalCallee.object.name) {
      const firstArgument = finalCallee.parent.arguments[0] ? finalCallee.parent.arguments[0] : { type: 'None' }
      const firstArgumentParsed = firstArgument.type === 'Literal' ? firstArgument.value : summarizeMemberExpression(firstArgument);
      if (firstArgumentParsed === null) return null; // Just give up at this point...
      return {
        class: finalCallee.object.name,
        method: finalCallee.property.name,
        firstArguement: firstArgumentParsed
      };
    }

    // If there's another one to iterate.
    if (finalCallee.object.callee) {
      finalCallee = finalCallee.object.callee;
      if (finalCallee.type === 'Identifier') return null;
    }

    continue;
  }

  return null;
}

module.exports = {
  meta: {
    messages: {
      noDuplicateSelectors: 'No duplicate Cypress selectors.'
    },
  },
  create(context) {
    return {
      // Per class declaration.
      ClassDeclaration(node) {
        const appliedSelectors = [];
        const classBody = node.body;
        const allMethodDefs = classBody.body.filter(def => def.type === 'MethodDefinition')
        for (let i = 0; i < allMethodDefs.length; i += 1) {
          const methodDefinition = allMethodDefs[i];
          const returnStatements = getReturnStatements(methodDefinition);
          for (const statement of returnStatements) {
            const finalCallee = getFinalCallee(statement);

            // Guards.
            if (!finalCallee || finalCallee == null) return; // Don't apply to callees that can't be defined.
            if (finalCallee.class !== 'cy') return; // Don't apply to callees that aren't chained from cy.
            if (finalCallee.method !== 'get' && finalCallee.method !== 'contains') return; // Don't apply to callees that arne't get or contains.
            if (finalCallee.firstArguement === 'IGNORE_ME') return; // Don't apply to specific ignore scenarios.
            const id = `${finalCallee.method}:${finalCallee.firstArguement}`

            // Exclude from the rule if they are just alpha numeric.
            // Todo: Ignore if the method has a contains after it that is different.
            const alphaNumberic = new RegExp(/^[a-z0-9]+$/i)
            if (!alphaNumberic.test(finalCallee.firstArguement)) {
              if (appliedSelectors.includes(id)) {
                context.report({ node: statement, messageId: 'noDuplicateSelectors'})
              } else {
                appliedSelectors.push(id); 
              }
            }
          }
        }
      },
    };
  },
};
