# interpolate-shell

Takes a string that has placeholders containing shell commands, replaces the placeholders with the stdout value of their shell commands, and calls a callback with the result.

## install

```sh
npm install interpolate-shell
```

## example

```js
const interpolateShell = require('interpolate-shell')

interpolateShell('id: {{ id -u }}', (errors, result) => {
  result // 'id: 1000'
})

interpolateShell('id: ${ id -u }', {left: '${', right: '}'}, (errors, result) => {
  result // 'id: 1000'
})
```

## API

### `interpolateShell(template, [options], cb)`

- `template: string`
- `options: object`
  - `left: string` left delimiter
  - `right: string` right delimiter
  - `ignoreErrors: boolean, false` process template even if a command fails. By default, running commands will be killed and there will be no result when a command fails.
- `cb: function (errors, result)`
