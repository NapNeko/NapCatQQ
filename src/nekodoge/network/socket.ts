import { createServer } from 'node:net';

export class NewAdapterNetwork {
    constructor(public host: number, public port: number) { }
    async open() {
        const server = createServer((socket) => {
            socket.on('data', (data) => {

            });
            socket.on('end', () => {

            });
            socket.on('connect', () => {

            });
        });
        server.listen(this.port, this.host);
    }
}
