const {exec} = require('child_process')
const replace = require('string-replace')
const Regex = require('interpolate-regex')
const optionalArgs = require('optional-args')
const {EventEmitter} = require('events')
const terminate = require('terminate')

const defaults = {
  left: '{{',
  right: '}}',
  concurrent: true,
  ignoreFailure: false
}

const interpolate = (template, options, cb) => {
  options = Object.assign({}, defaults, options)
  const regex = Regex(options.left, options.right, true)
  const emitter = new EventEmitter()
  let failed = false
  replace(template, regex, (done, _, cmd) => {
    if (!cmd.length) {
      done(undefined, '')
    } else {
      if (failed) {
        return done()
      }
      let thisOneFailed = false
      const p = exec(cmd, (err, stdout, stderr) => {
        if (failed) {
          return done()
        }
        if (err && options.ignoreFailure !== true) {
          failed = true
          thisOneFailed = true
          emitter.emit('failure')
          return done(err)
        } else {
          done(undefined, stdout.trim())
        }
      })
      emitter.on('failure', () => {
        if (!thisOneFailed) {
          terminate(p.pid, () => done())
        }
      })
    }
  }, {parallel: options.concurrent}, cb)
}

module.exports = optionalArgs(1, 3, interpolate)
