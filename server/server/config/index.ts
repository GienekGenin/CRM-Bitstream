import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
	db: {
		auth: {
			user: process.env.DB_USER,
			password: process.env.DB_PASS
		},
		CS: process.env.DB_CS
	},

	server: {
		port: process.env.PORT
	},

	iothub: {
		cs: process.env.IOTHUB_CONNECTION_STRING
	}
};

