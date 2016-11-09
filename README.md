# interpolate-shell

Takes a string that has placeholders containing shell commands, replaces the placeholders with the stdout value of their shell commands, and calls a callback with the result.

## install

```sh
npm install interpolate-shell
```

## example

```js
const interpolateShell = require('interpolate-shell')

interpolateShell('id: {{ id -u }}', (err, result) => {
  result // 'id: 1000'
})

interpolateShell('id: ${ id -u }', {left: '${', right: '}'}, (err, result) => {
  result // 'id: 1000'
})

// execute sequentially rather than concurrently
interpolateShell('{{ command_1 }} {{ command_2 }}', {concurrent: false}, (err, result) => {

})
```

## API

### `interpolateShell(template, [options], cb)`

- `template: string`
- `options: object`
  - `left: string` left delimiter
  - `right: string` right delimiter
  - `concurrent: boolean, true` execute commands concurrently or sequentially
  - `ignoreFailure: boolean, false` process template even if a command fails. By default, processing will stop and `cb` will be called with `err` when a command fails.
- `cb: function (err, result)`
