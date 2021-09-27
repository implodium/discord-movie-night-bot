# Discord Movie Night App

This application can be run on any discord bot. Just define your token in the .env file and run the token on your 
desired bot. This application is primary for managing a movie night. The features should be the following.

- [x] Voting for a movie via discord reactions
- [x] Announcements in specific intervals for a new movie night
- [ ] Manual Announcements for a new movie night
- [x] displaying the most voted movie
- [ ] Specific configurable events with different voting system.

## Running the Application

### Configuring `.env` files

There are two .env file `.env.prod` and `.env.dev` in the config directory. For those environment there is a template 
file 
and a secret file.
You can use the template file to create a new .env config or use the repository default encrypted one if you are 
authorized.

### Develop

The following command will start the application in watch mode.

```
npm start
```

### Production

#### Run

```
docker-compose up --build
```

- `--build` is for building the application before starting

#### Build only

```
docker-compose build
```

#### Pulling latest docker image from GitHub

```
docker-compose pull
```
