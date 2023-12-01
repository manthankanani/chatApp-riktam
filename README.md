# chatApp type Demo interview


---
## Requirements

For development, you will only need Node.js and a node global package, Yarn, installed in your environement.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v18.13.0

    $ npm --version
    6.14.8

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

###
### Yarn installation
  After installing node, this project will need yarn too, so just run the following command.

      $ npm install -g yarn

---

## Install

    $ git clone https://github.com/manthankanani/chatApp-riktam.git
    $ cd chatApp-riktam
    $ npm install

## Configure app

- Open `assessories` and then import `test_qt.sql` MySQL schema to your local database.
- Rename `example.env` to `.env` and update neccasary information.
- There are 2 default users (admin and user)
-- which having username:password are `admin:passWord` and `user:passWord` respectively.

## Running the project

    $ npm start

## Run test suite for the whole application

    $ npm test

## Simple build for production

    $ npm build