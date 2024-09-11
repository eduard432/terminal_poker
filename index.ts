import { input, select } from '@inquirer/prompts';
import chalk from 'chalk'
import express from 'express'
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const log = console.log

const getRandomNum = (min = 1, max = 9) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomCode = (max = 6): string => {
    const codeArray = []
    for (let i = 1; i <= max; i++) {

        codeArray.push(getRandomNum())
    }
    return codeArray.join('')
}

type Blind = [number, number]

interface Table {
    blind: Blind,
    code: string,
    name: string
}

const tableRecords: { [key: string]: Table } = {};

const createTable = async () => {
    const tableName = await input({ message: "Table name:" })

    const blind = await select<Blind>({
        message: 'Select blind:', choices: [
            {
                name: '2k/4k',
                value: [2000, 4000]
            },
            {
                name: '10k/20k',
                value: [10000, 20000]
            }
        ]
    })


    let tableCode = getRandomCode()
    while (tableRecords[tableCode]) {
        tableCode = getRandomCode()
    }

    tableRecords[tableCode] = {
        blind,
        name: tableName,
        code: tableCode
    }


    log(chalk.red(tableName) + " - Code: " + chalk.blue(tableCode))
}

const startServer = async () => {
    console.log(tableRecords)

    const app = express()
    const server = createServer(app)
    const io = new Server(server);

    io.disconnectSockets()
    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('join_table', ({code}: {code:string}) => {
            if(tableRecords[code]) {
                socket.emit('join_success', {
                    tableInfo: tableRecords[code]
                })
            }
        })
    });


    server.listen(3000, () => {
        console.log('server running at http://localhost:3000');
    });
}

const main = async () => {
    let option = 0

    while (option != 3) {

        console.log('---------------------------')
        option = await select<number>({
            message: "Select Option:",
            choices: [
                {
                    name: "Start server",
                    value: 1
                },
                {
                    name: "Add table",
                    value: 2,
                },
                {
                    name: "Close Menu",
                    value: 3
                }
            ]
        })


        if (option == 1) {
            await startServer()
            option = 0
        }

        if (option == 2) {
            await createTable()
            option = 0
        }
    }

}

main()