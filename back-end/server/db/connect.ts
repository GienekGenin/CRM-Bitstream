import * as mongoose from 'mongoose';

class DBConnectionHandler {
    public connection: any;
    private state: string;

    connect() {
        this.connection = mongoose.connect(process.env.DB_CS, {
            auth: {
                user: process.env.DB_USER,
                password: process.env.DB_PASS
            }
        });

        mongoose.set('debug', true);

        mongoose.connection.on('connected', () => {
            this.state = 'connected';
        });

        mongoose.connection.on('error', () => {
            this.state = 'disconnected';
        });

        mongoose.connection.on('disconnected', () => {
            this.state = 'disconnected';
        });
        process.on('SIGINT', () => {
            mongoose.connection.close()
                .then(() => {
                    this.state = 'disconnected';
                    process.exit(0);
                })
                .catch(e => console.log(e));
        });
    }
}

export const dbConnectionService = new DBConnectionHandler();
