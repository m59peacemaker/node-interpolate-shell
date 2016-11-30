const test = require('tape')
const isNil = require('is-nil')
const interpolate = require('../')

{
  const cmd = 'echo "hey"'
  test(cmd, t => {
    t.plan(1)
    interpolate(`{{${cmd}}}`, undefined, (errors, result) => {
      errors ? t.fail(errors) : t.equal(result, 'hey')
    })
  })
}

test('options arg is optional', t => {
  t.plan(1)
  interpolate('{{echo "hey"}}', (errors, result) => {
    errors ? t.fail(errors) : t.equal(result, 'hey')
  })
})

test('placeholder extra whitespace is allowed', t => {
  t.plan(3)
  interpolate('{{ echo "hey"}}', (errors, result) => {
    errors ? t.fail(errors) : t.equal(result, 'hey')
  })
  interpolate('{{echo "hey" }}', (errors, result) => {
    errors ? t.fail(errors) : t.equal(result, 'hey')
  })
  interpolate('a {{ echo "b"    }} c', (errors, result) => {
    errors ? t.fail(errors) : t.equal(result, 'a b c')
  })
})

test('stdout extra whitespace is trimmed', t => {
  t.plan(1)
  interpolate('{{ echo "  hey  " }}', (errors, result) => {
    errors ? t.fail(errors) : t.equal(result, 'hey')
  })
})

test('replaces empty placeholder', t => {
  t.plan(1)
  interpolate('{{ echo "hey" }}-{{}}', (errors, result) => {
    errors ? t.fail(errors) : t.equal(result, 'hey-')
  })
})

{
  const cmd = 'sleep 1; echo "hey"'
  test(cmd, t => {
    t.plan(1)
    interpolate(`{{ ${cmd} }}`, (errors, result) => {
      errors ? t.fail(errors) : t.equal(result, 'hey')
    })
  })
}

{
  const cmd = `echo "ay" | awk {'print $0 "-oh"'}`
  test(cmd, t => {
    t.plan(1)
    interpolate(`{{ ${cmd} }}`, (errors, result) => {
      errors ? t.fail(errors) : t.equal(result, 'ay-oh', result)
    })
  })
}

test('nothing from stdout, just remove placeholder', t => {
  t.plan(1)
  interpolate('{{awk}}', (errors, result) => {
    errors ? t.fail(errors) : t.equal(result, '')
  })
})

test('custom delimiters', t => {
  t.plan(1)
  interpolate('!! echo "wut"  ??', {left: '!!', right: '??'}, (errors, result) => {
    errors ? t.fail(errors) : t.equal(result, 'wut')
  })
})

test('executes commmands concurrent by default (sleep 1)', t => {
  t.plan(1)
  const startTime = new Date().getTime()
  interpolate('{{sleep 1}} {{sleep 1}}, {{sleep 1}}', (errors, result) => {
    if (errors) {
      t.fail(errors)
    } else {
      const totalTime = new Date().getTime() - startTime
      t.true(totalTime < 2000, `Took: ${totalTime}ms`)
    }
  })
})

test('returns ordered array of errors', t => {
  t.plan(3)
  interpolate('{{sleep 2 && exit 7}} {{awk}} {{exit 9}}', (errors, result) => {
    t.equal(errors.length, 3)
    t.equal(errors[1], undefined)
    const e = errors[2].toString()
    t.true(e.includes('9'), e)
  })
})

test('stop on command failure by default', t => {
  t.plan(2)
  interpolate('{{exit 1}} {{sleep 1 && echo "hey"}}', (errors, result) => {
    t.equal(result, undefined, 'no result after failed command')
    isNil(errors) ? t.fail('no errors!') : t.pass(errors[0])
  })
})

test('stops as soon as a command fails', t => {
  t.plan(1)
  const startTime = new Date().getTime()
  interpolate('{{sleep 10}} {{exit 1}}', (errors, result) => {
    const totalTime = new Date().getTime() - startTime
    t.true(totalTime < 1000, `Took: ${totalTime}ms`)
  })
})

test('ignore failed commands when options.ignoreErrors = true', t => {
  t.plan(2)
  interpolate('{{exit 7}} {{echo "hey"}} {{exit 9}}', {ignoreErrors: true}, (errors, result) => {
    t.true(errors[0] && errors[2])
    t.equal(result, ' hey ')
  })
})

test('calls the callback even though there is nothing to interpolate', t => {
  t.plan(2)
  const input = 'hey jude'
  interpolate(input, (errors, result) => {
    t.equal(errors, undefined)
    t.equal(result, input)
  })
})
