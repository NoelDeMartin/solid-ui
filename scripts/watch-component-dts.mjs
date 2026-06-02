import { spawn } from 'child_process'
import { existsSync, watch } from 'fs'
import path from 'path'
import { componentPackages } from './component-manifest.mjs'

const componentDirs = componentPackages.map(({ distSegment }) =>
  path.resolve(process.cwd(), 'dist', distSegment)
)
const scriptPath = path.resolve(process.cwd(), 'scripts/build-component-dts.mjs')
let buildTimer = null
let running = false
let waiting = false

const runBuild = () => {
  if (running) return
  running = true
  const child = spawn(process.execPath, [scriptPath], {
    stdio: 'inherit'
  })

  child.on('exit', code => {
    running = false
    if (code !== 0) {
      console.error(`build-component-dts exited with code ${code}`)
    }
  })
}

const scheduleBuild = () => {
  clearTimeout(buildTimer)
  buildTimer = setTimeout(() => {
    if (componentDirs.every(dir => existsSync(dir))) {
      runBuild()
    }
  }, 150)
}

const startWatcher = () => {
  const missingDirs = componentDirs.filter(dir => !existsSync(dir))

  if (missingDirs.length > 0) {
    if (!waiting) {
      console.log(`Waiting for component declaration directories before watching: ${missingDirs.join(', ')}`)
      waiting = true
    }
    setTimeout(startWatcher, 250)
    return
  }

  if (waiting) {
    console.log('Component declaration directories exist; starting watch...')
  } else {
    console.log(`Watching component declaration directories: ${componentDirs.join(', ')}`)
  }

  for (const componentDir of componentDirs) {
    watch(componentDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return
      if (filename.endsWith('.d.ts') || filename.endsWith('.js') || filename.endsWith('.map')) {
        scheduleBuild()
      }
    })
  }
}

runBuild()
startWatcher()
