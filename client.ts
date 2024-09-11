import { io } from 'socket.io-client'
import { input, select } from '@inquirer/prompts'
import chalk from 'chalk'
// import ora from 'ora'


const joinTable = async () => {
    // const spinner = ora('Conectado al servidor...').start();
	const socket = io("http://localhost:3000")
    // spinner.succeed()
    console.log("Connected to the server")

	const code = await input({
		message: 'Type table code',
		validate: (value) => value.length === 6 && !isNaN(Number(value)) ,
	})

    // spinner.text = "Joinning..."

	socket.emit('join_table', { code })
    socket.on('join_success', (info) => {

        // spinner.succeed()
    })

    socket.disconnect()
}

let CHIP_COUNT = 0

const addChips = async () => {
	console.log('Actual balance: ', chalk.green('$' + CHIP_COUNT))
	const amount = await input({
		message: 'Amount to add:',
		validate: (value) => !isNaN(Number(value)),
	})
	CHIP_COUNT += Number(amount)
	console.log('Updated balance: ', chalk.green('$' + CHIP_COUNT))
	return CHIP_COUNT
}

const main = async () => {
	let option = 0

	while (option != 3) {
		console.log('---------------------------')
		option = await select<number>({
			message: 'Select Option:',
			choices: [
				{
					name: 'Joins Table',
					value: 1,
				},
				{
					name: 'Add chips',
					value: 2,
				},
				{
					name: 'Close Menu',
					value: 3,
				},
			],
		})

		if (option == 1) {
			await joinTable()
			option = 0
		}

		if (option == 2) {
			await addChips()
			option = 0
		}
	}
}

main()
