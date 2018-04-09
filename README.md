# ribot API

## Introduction
This API allows you to access information about each ribot, as well as perform actions on your own profile such as update your location, status and availability. It will also allow access to health information such as water consumption.

## Setting up your development environment
Make sure you have [node](https://nodejs.org/en/), if not it's probably simplest to install them through [brew](https://brew.sh).

Set up the development environment variables by duplicating the `.env.example` file to one called `.env`. Inside that file replace any example values (denoted by `<replace>`) with real values. Take a look at the table below if you are unsure what any of the environment variables do.

| Variable Name          | Description                                                                                                                                                                               |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `PORT`                 | The port number the express server should listen for incoming connections on                                                                                                              |
| `BASE_URL`             | The user visible URL. In a development environment it will likely have the port number as shown in the example. In production this will likely be a nicer URL such as http://api.ribot.io |
| `LOG_LEVEL`            | What level of logs should be outputted. From most to least verbose these are: `debug`, `info`, `warn` and `error`                                                                         |
| `JWT_SECRET`           | The secret to encrypt the JSON Web Tokens with. In development this value doesn't matter, however in production it should be a long random string                                         |
| `DATABASE_URL`         | The connection string to the postgres database                                                                                                                                            |
| `DATABASE_DEBUG`       | Boolean. If this is set to `true` the query and results of every database operation is logged. This happens irrespective of the `LOG_LEVEL` and can be extremely noisy                    |
| `GOOGLE_API_BASE_URL`  | The base URL for the Google APIs. The example will almost always be the correct value                                                                                                     |
| `GOOGLE_CLIENT_ID`     | The server's client ID from the [Google Developer Console](https://console.developers.google.com)                                                                                         |
| `GOOGLE_CLIENT_SECRET` | The server's client secret from the [Google Developer Console](https://console.developers.google.com)                                                                                     |

You need to install [postgresSQL](https://www.postgresql.org/download/macosx/), create a `ribot` user, and create two databases `ribot-api` and `ribot-api-test`, making sure to assign the `ribot` user as owner of these databases.

To start the node project you now need to install node dependancies and start the node server:

```
npm install
npm start
```

You may also want to seed the database with some example data. To do this you can run the setup script. **Note: This will drop all the tables and recreate them without confirmation. You WILL loose all the data.**

```
node data/scripts/setup.js --seed
```

## Running the tests
The best way to run tests is:

```
npm test
```

## Database setup
When the app is started the server will look at the database and determine if it needs to make any changes to the database.

If this is the first time the app is run it will detect there are no tables and create them all from the `data/schema.js` file description. If it's not running in production it will also seed the database with the data in the `data/seed.js` file.

The database schema is also versioned. The `data/schema.js` version always has the most up-to-data schema which will be set up on a blank database. The schema version number is stored inside the database in the `metadata` table. This allows the server to check when it is run if the version of schema the database has matches the version it expects. If it does not it will run a series of migration scripts to alter the table to the format it expects.

These migration scripts live in `data/migrations` and export a single function that accepts a Knex transaction as a parameter. It can then make the changes it needs to increment the database schema from one version to another.

A migration script will only make the changes up a single version. For example if the latest schema version is `5` and the current database schema version is `2` the app will run script `3` to make the changes from `2` to `3`, and so on until the schema is at the latest version.

### Making changes to the database schema
When you change the database schema you need to ensure you write a migration script so the system is able to migrate the database up to the new version.

The first step is to change the schema in the `data/schema.js` file and increment the `version` variable at the top of the file.

You then need to write a migration script that makes all the changes needed to migrate the database up to your new version. To do this:

1. Create a new migration script in the `data/migrations` folder using `example-migration.js` as a base. The name should begin with the new schema version number so it is easy to see the sequence of migrations
2. Add in all the SQL commands that are needed to ensure the tables and data is correct for your new version
3. Add a new line to the `exports` of the `data/migrations/index.js` file with the new schema number and a `require` to your migration script. There is an example at the top of the file
4. Test your migration works on your local machine!

## Deploying the app
Changes to master will automatically cause the app to be deployed to [Dokku](https://api.ribot.io). You should not need to deploy manually. If you do however you can set up your machine by adding a new git remote and then push to it:

```
git remote add deploy dokku@ribot.io:api
git push deploy master
```

## Testing Google OAuth

1. Go to the [Google OAuth playground with the correct basic settings](https://developers.google.com/oauthplayground/#step1&apisSelect=https%3A//www.googleapis.com/auth/userinfo.email%2Chttps%3A//www.googleapis.com/auth/userinfo.profile%2Chttps%3A//www.googleapis.com/auth/userinfo.email%2Chttps%3A//www.googleapis.com/auth/userinfo.profile&url=https%3A//&content_type=application/json&http_method=GET&useDefaultOauthCred=checked&oauthEndpointSelect=Google&oauthAuthEndpointValue=https%3A//accounts.google.com/o/oauth2/auth&oauthTokenEndpointValue=https%3A//www.googleapis.com/oauth2/v3/token&includeCredentials=unchecked&accessTokenType=query&autoRefreshToken=unchecked&accessType=offline&forceAprovalPrompt=unchecked&response_type=code)
2. Click the cog in the top right and enter the *Client ID* and *Client Secret* from the `.env` file you are using
3. Press *Authorize APIs* and follow the steps with your ribot account
4. Copy the *Authorization code*
5. Use Paw/Postman/cURL to make a request to `POST /auth/sign-in` with the `googleAuthorizationCode` you copied along with a `googleRedirectUri` of `https://developers.google.com/oauthplayground`
6. You should now be logged in

## Licence

```
Copyright 2015 Ribot Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
