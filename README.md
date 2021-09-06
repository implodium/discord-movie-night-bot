# Discord Movie Night App

This application can be run on any discord bot. Just define your token in the .env file and run the token on your 
desired bot. This application is primary for managing a movie night. The features should be the following.

- [ ] Voting for a movie via discord reactions
- [ ] Announcements in specific intervals for a new movie night
- [ ] Manual Announcements for a new movie night
- [ ] displaying the most voted movie
- [ ] Specific configurable events with different voting system.

## Running the Application

### Develop

The following command will start the application in watch mode.

```
npm start
```

### Production

#### Run

```
docker-compose -e TOKEN=<Your Token> up --build
```

- `--build` is for building the application before starting
- `-e TOKEN=<Your Token>` place your discord bot token here
  - you can also overwrite the `.env.prod` file

#### Build only

```
docker-compose build
```

#### Pulling latest docker image from GitHub

```
docker-compose pull
```
