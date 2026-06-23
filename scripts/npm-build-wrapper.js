const { spawnSync } = require('child_process')

// Read configuration passed as npm CLI option without `--` (npm sets npm_config_* env vars)
let config = process.env.npm_config_configuration || process.env.npm_config_config || process.env.npm_config_prod || null

// When using `npm run build --configuration production` (no extra `--`),
// npm may set the env var to the string 'true' and pass the value as a positional arg.
if (config === 'true') {
  const extraArg = process.argv[2]
  if (extraArg) config = extraArg
}

const args = ['ng', 'build']
if (config) {
  args.push('--configuration', config)
} else {
  // pass any extra args forwarded by npm when `npm run build -- --flag` is used
  const extra = process.argv.slice(2)
  if (extra.length) args.push(...extra)
}

// Use npx to ensure local angular CLI is resolved
const cmd = 'npx'
const cmdArgs = args

const res = spawnSync(cmd, cmdArgs, { stdio: 'inherit' })
process.exit(res.status)
