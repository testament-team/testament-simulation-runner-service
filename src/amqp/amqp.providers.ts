import { Provider } from '@nestjs/common';
import { connect, Connection } from 'amqplib';
import { env } from 'process';

export const amqpProviders: Provider[] = [
    {
        provide: "AmqpConnection",
        useFactory: async () => { 
            const connection: Connection = await connect({
                protocol:   env["AMQP_PROTOCOL"],
                hostname:   env["AMQP_HOSTNAME"],
                port:       parseInt(env["AMQP_PORT"]),
                username:   env["AMQP_USERNAME"],
                password:   env["AMQP_PASSWORD"],
            });
            connection.on("error", (err) => {
                console.error(err);
            });
            return connection;
        }
    },
    {
        provide: "AmqpChannel",
        useFactory: (connection: Connection) => connection.createChannel(),
        inject: ["AmqpConnection"]
    }
];