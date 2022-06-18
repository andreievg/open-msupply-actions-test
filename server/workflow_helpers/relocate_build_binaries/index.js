const { argv } = require('process')
const { execSync } = require('child_process')
const { mkdirSync, rmSync } = require('fs')

// Usage: cargo build --tests --message-format=json | node workflow_helpers/relocate_build_binaries out_folder_name

const main = () => {
    let data = ''
    // stdin for piping |
    let stdin = process.openStdin()
    stdin.on('data', (d) => (data += d))
    stdin.on('end', () => {
        if (argv[2] !== '--test') {
            let targetDir = argv[2]

            reCreateDir(targetDir)
            let executableList = extractFilenames(data)

            let command = `mv ${executableList.join(' ')}  ${targetDir}`
            console.log('Executing command:', command)
            execSync(command, { stdio: 'inherit' })
        } else {
            // test with:
            // cat test_input.txt | node index.js --test
            test(data)
        }
    })
}

const reCreateDir = (dir) => {
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })
}

const extractFilenames = (input) => {
    let executableList = input
        .trim()
        // --message-format=json output is json seperated by newline
        .split('\n')
        .map(JSON.parse)
        // just the test binaries
        .filter(({ profile }) => profile?.test)
        // we want to extra this field
        .map(({ executable }) => executable)
        // some json output might not have executable key
        .filter((e) => e)

    // make unique
    return Array.from(new Set(executableList))
}

const test = (testInput) => {
    const testAssert = [
        '/Users/andreievguenov/Documents/repos/public/rust-build-workflow/target/debug/deps/one-027ad73cb4105bfd',
        '/Users/andreievguenov/Documents/repos/public/rust-build-workflow/target/debug/deps/two-9d2e7e63f0a28ba4',
    ]
    let result = extractFilenames(testInput)
    if (result.toString() === testAssert.toString()) {
        console.log('Test: OK')
    } else {
        console.log('Test: Assert Fail', result, testAssert)
        process.exit(1)
    }
}

main()

// Previously was using the following, but though it was hard for everyone to understand

// grep -o '"executable":"[^"]*' test_build_info.txt | grep -o '[^"]*$' > binary_file_list.txt
// mkdir binary_files
// cat binary_file_list.txt | xargs -I '{}' mv '{}' ./binary_files/.
