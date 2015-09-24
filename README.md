# ribot API

## Introduction
This API allows you to access information about each ribot, as well as perform actions on your own profile such as update your location, status and availability. It will also allow access to health information such as water consumption.

## Setting up your development environment
We are using [Vagrant](https://www.vagrantup.com/) to manage the development environment. This ensure that all developers can be set up very quickly and in the same configuration. This in turn avoids issues where "it works on my machine".

To get started you must [install Vagrant](https://www.vagrantup.com/downloads.html) and [install Virtualbox](https://www.virtualbox.org/wiki/Downloads). If you are using [Homebrew](http://brew.sh) you can install box from the command line by running:

```sh
brew install caskroom/cask/brew-cask
brew cask install virtualbox
brew cask install vagrant
```

Once both of these tools are installed, you can start the development environment by running this command from the root of the project:

```sh
vagrant up
```

This will download the required virtual machine, install all the project dependancies and start the virtual machine. The virtual machine will then be used to run the project code, in an enviroment that is the same on every developers machine.

To start the node project on the VM you now need to SSH into it, change into the `app` directory, install node dependancies and start the node server:

```sh
vagrant ssh
cd app
npm install --no-bin-links
npm start
```

## Running the tests
The best way to run tests is from inside the Vagrant VM:

```sh
vagrant ssh
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

## Adding a new dependency to the VM
Sometimes you may want to add a new dependency to the VM, for example MongoDB, Redis or Postgres. These sort of dependencies are installed on the VM using [Chef](https://www.chef.io/).

Chef installs dependancies using [Cookbooks](https://supermarket.chef.io/) (sigh... developer puns...). Cookbooks are simply a file which tells chef how to install a specific piece of software. All cookbooks for this project (along with dependancies) are stored in the `cookbooks` folder. This project is written using nodejs, so we have a cookbook for that, along with ones for all the dependancies it needs.

Managing these cookbooks is not complex, however it is boring, so we have chosen to use [Librarian](https://github.com/applicationsonline/librarian-chef) to manage them. To install this tool you can run:

```sh
gem install librarian-chef
```

Dependancies are managed using the `Cheffile`. To add a new dependency, add a new line to the file, for example:

```ruby
cookbook 'mongodb', '~> 0.16.2'
```

And then run:

```sh
librarian-chef install
```

This will download all the cookbooks needed for MongoDB and place them in the `cookbooks` folder. All these changes can be commited to git. Sometimes people choose not to commit the `cookbooks` directory, however we choose to commit this to avoid each developer having to install librarian just to start developing the project.

You now need to tell Vagrant to install this recipe when provisoning. Add a new line to the `Vagrantfile` with the name of the new cookbook:

```sh
chef.add_recipe "mongodb"
```

The last step is to "provision" your VM again. This means that the VM will be restarted with all the new dependancies by running Chef again. This also needs to be done by every other developer who created the VM before the changes to the `cookbooks` folder were made. Thankfully it's a simple command!

```sh
vagrant provision
```

## Deploying the app
Changes to master will automatically cause the app to be deployed to [Dokku](https://ribot-api.ribot.io). You should not need to deploy manually. If you do however you can set up your machine by adding a new git remote and then push to it:

```sh
git remote add deploy dokku@ribot.io:ribot-api
git push deploy master
```

## Testing Google OAuth

1. Go to the [Google OAuth playground with the correct basic settings](https://developers.google.com/oauthplayground/#step2&apisSelect=https%3A//www.googleapis.com/auth/userinfo.email%2Chttps%3A//www.googleapis.com/auth/userinfo.profile%2Chttps%3A//www.googleapis.com/auth/userinfo.email%2Chttps%3A//www.googleapis.com/auth/userinfo.profile&auth_code=4/giB9Uhx-o1yD6wpFhuf52uqQhFqkIBKTj2T4Um78HmY&url=https%3A//&content_type=application/json&http_method=GET&useDefaultOauthCred=checked&oauthEndpointSelect=Google&oauthAuthEndpointValue=https%3A//accounts.google.com/o/oauth2/auth&oauthTokenEndpointValue=https%3A//www.googleapis.com/oauth2/v3/token&includeCredentials=unchecked&accessTokenType=query&autoRefreshToken=unchecked&accessType=offline&forceAprovalPrompt=unchecked&response_type=code)
2. Click the cog in the top right and enter the *Client ID* and *Client Secret* from the `.env` file you are using
3. In the list of scopes find *Google OAuth  API v2* and select the *user.email* and *user.profile* scopes
4. Press *Authorize APIs* and follow the steps with your ribot account
5. Copy the *Authorization code*
6. Use Paw/Postman/cURL to make a request to `POST /auth/sign-in` with the `googleAuthorizationCode` you copied along with a `googleRedirectUri` of `https://developers.google.com/oauthplayground`
7. You should now be logged in
