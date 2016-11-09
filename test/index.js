const test = require('tape')
const interpolate = require('../')

{
  const cmd = 'echo "hey"'
  test(cmd, t => {
    t.plan(1)
    interpolate(`{{${cmd}}}`, undefined, (err, result) => {
      err ? t.fail(err) : t.equal(result, 'hey')
    })
  })
}

test('options arg is optional', t => {
  t.plan(1)
  interpolate('{{echo "hey"}}', (err, result) => {
    err ? t.fail(err) : t.equal(result, 'hey')
  })
})

test('placeholder extra whitespace is allowed', t => {
  t.plan(3)
  interpolate('{{ echo "hey"}}', (err, result) => {
    err ? t.fail(err) : t.equal(result, 'hey')
  })
  interpolate('{{echo "hey" }}', (err, result) => {
    err ? t.fail(err) : t.equal(result, 'hey')
  })
  interpolate('a {{ echo "b"    }} c', (err, result) => {
    err ? t.fail(err) : t.equal(result, 'a b c')
  })
})

test('stdout extra whitespace is trimmed', t => {
  t.plan(1)
  interpolate('{{ echo "  hey  " }}', (err, result) => {
    err ? t.fail(err) : t.equal(result, 'hey')
  })
})

{
  const cmd = 'sleep 1; echo "hey"'
  test(cmd, t => {
    t.plan(1)
    interpolate(`{{ ${cmd} }}`, (err, result) => {
      err ? t.fail(err) : t.equal(result, 'hey')
    })
  })
}

{
  const cmd = `echo "ay" | awk {'print $0 "-oh"'}`
  test(cmd, t => {
    t.plan(1)
    interpolate(`{{ ${cmd} }}`, (err, result) => {
      err ? t.fail(err) : t.equal(result, 'ay-oh', result)
    })
  })
}

test('nothing from stdout, just remove placeholder', t => {
  t.plan(1)
  interpolate('{{awk}}', (err, result) => {
    err ? t.fail(err) : t.equal(result, '')
  })
})

test('custom delimiters', t => {
  t.plan(1)
  interpolate('!! echo "wut"  ??', {left: '!!', right: '??'}, (err, result) => {
    err ? t.fail(err) : t.equal(result, 'wut')
  })
})

test('executes commmands concurrent by default (sleep 1)', t => {
  t.plan(1)
  const startTime = new Date().getTime()
  interpolate('{{sleep 1}} {{sleep 1}}, {{sleep 1}}', (err, result) => {
    if (err) {
      t.fail(err)
    } else {
      const totalTime = new Date().getTime() - startTime
      t.true(totalTime < 2000, `Took: ${totalTime}ms`)
    }
  })
})

test('options.concurrent = false, runs in sequence', t => {
  t.plan(1)
  const startTime = new Date().getTime()
  interpolate('{{sleep 1}} {{sleep 1}}', {concurrent: false}, (err, result) => {
    if (err) {
      t.fail(err)
    } else {
      const totalTime = new Date().getTime() - startTime
      t.true(totalTime > 2000, `Took: ${totalTime}ms`)
    }
  })
})

test('stop on command failure by default', t => {
  t.plan(2)
  interpolate('{{exit 1}} {{echo "hey"}}', (err, result) => {
    t.equal(result, undefined, 'no result after failed command')
    t.equal(typeof err, 'object', err)
  })
})

test('stops as soon as a command fails', t => {
  t.plan(1)
  const startTime = new Date().getTime()
  interpolate('{{sleep 10}} {{exit 1}}', (err, result) => {
    const totalTime = new Date().getTime() - startTime
    t.true(totalTime < 1000, `Took: ${totalTime}ms`)
  })
})

test('ignore failed commands when options.ignoreFailure = true', t => {
  t.plan(1)
  interpolate('{{exit 1}} {{echo "hey"}}', {ignoreFailure: true}, (err, result) => {
    err ? t.fail(err, 'err not ignored: ' + err) : t.equal(result, ' hey')
  })
})
