const { readdirSync } = require('fs')
const { execSync } = require('child_process')
const { argv } = require('process')
const path = require('path')

const unixPrefix = process.platform === 'win32' ? '' : './'

// Usage: node workflow_helpers/execute_all_in_folder out_folder_name
const main = () => {
    const folder = argv[2]
    readdirSync(argv[2], 'utf8').map((executable) => {
        const command = `${unixPrefix}${path.join(folder, executable)}`
        console.log('Executing command:', command)
        execSync(command, { stdio: 'inherit' })
    })
}

main()
