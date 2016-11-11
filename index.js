const {exec} = require('child_process')
const replace = require('replace-async')
const Regex = require('interpolate-regex')
const optionalArgs = require('optional-args')
const terminate = require('terminate')
const isNil = require('is-nil')

const defaults = {
  left: '{{',
  right: '}}',
  ignoreErrors: false
}

const interpolate = (template, options, cb) => {
  options = Object.assign({}, defaults, options)
  const regex = Regex(options.left, options.right, true)
  replace(template, regex, (done, _, cmd) => {
    if (!cmd.length) {
      done(undefined, '')
    } else {
      const p = exec(cmd, (err, stdout, stderr) => {
        if (!isNil(err)) {
          done(new Error(`${cmd}: ${err.message}\n${stderr}`))
        } else {
          done(undefined, stdout.trim())
        }
      })
      return () => terminate(p.pid, done) // should only ever fire if p hasn't already finished
    }
  }, {ignoreErrors: options.ignoreErrors}, cb)
}

module.exports = optionalArgs(1, 3, interpolate)
