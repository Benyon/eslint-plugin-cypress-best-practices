# Cypress ESLint Plugin

An [ESLint](https://eslint.org) plugin for your [Cypress](https://cypress.io) tests.

Note: If you installed ESLint globally then you must also install `eslint-plugin-cypress-best-practices` globally.

## Installation

```sh
npm install eslint-plugin-cypress-best-practices --save-dev
```
or
```sh
yarn add eslint-plugin-cypress-best-practices --dev
```

## Usage

Add an `.eslintrc.json` file to your `cypress` directory with the following:

```json
{
  "plugins": [
    "cypress-best-practices"
  ]
}
```

You can add rules:

```json
{
  "rules": {
    "cypress-best-practices/enforce-page-object-model": "error",
    "cypress-best-practices/no-duplicate-selectors": "error",
    "cypress-best-practices/no-simple-selectors": "warn",
  }
}
```


## `enforce-page-object-model`

The cy.get command should be limited to page object files, any cy.get with a string literal will be detected with some minor exclusions.

```js
it('use literal string in cy.get', () => {
  ...
  /**
   * Will throw 'No literal string selectors inside test files.'
   */
  cy.get('#form > button:nth-child(1)').click()
  ...
})
```

## `no-duplicate-selectors`

This applies to the page object model, when a return expression contains a cy.get() action, it will compared with other return expressions to avoid duplicates.

```js
class HomePage {

  get loginButton() {
    return cy.get('#form > .actions > nth-child(1)');
  }

  get loginBtn() {
    /**
     * Will throw 'No duplicate Cypress selectors.'
     */
    return cy.get('#form > .actions > nth-child(1)');
  }
}
```

## `no-duplicate-selectors`

Any literal string selector that is only alphanumeric will be flagged.

```js
class HomePage {

  get loginButton() {
    return cy.get('#form > .actions > nth-child(1)');
  }

  get productImage() {
    /**
     * Will throw 'No generic selectors.'
     */
    return cy.get('img');
  }
}
```

## Contribution Guide

To add a new rule:
  * Fork and clone this repository
  * Generate a new rule
  * Write test scenarios then implement logic
  * Add the rule to this README
  * Create a PR

Use the following commit message conventions: https://github.com/semantic-release/semantic-release#commit-message-format
