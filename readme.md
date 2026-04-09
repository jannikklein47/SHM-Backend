This is the Backend System for the Smart-Home-Manager.
It utilizes Node.js with Express.

Before running, you need to create a .env file with your JWT secret and database credentials.

```
JWT_SECRET = "abc"
DB_USER = "postgres"
DB_HOST = "localhost"
DB_PASSWORD = "postgres"
DB_PORT = 5432
DB_NAME = "WAB_Test"
```

You need to create the database yourself. It must be a PostgreSQL database. The details must be set accordingly in the .env file.

To install all dependencies, run:

```
npm install
```

To create all tables and mock data, run:

```
npm run create-db
```

To start the backend, run

```
npm start
```
