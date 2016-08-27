# NSABot_api
Data interaction for local slack history storage.
Used with [NSABot](https://github.com/MillerJL/NSABot)

Koa, rethinkdb

## Important
Do NOT share or publish sensitive info in your .env (SLACK_TOKEN!)

## Installation
* Copy .env-sample to .env and modify contents to match necessary environment variables
* Run rethinkdb and setup db/collections if necessary
* npm install
* babel
* ???
* Use with [NSABot](https://github.com/MillerJL/NSABot)

## Usage
* Get up and running on your endpoint
* Point your NSABot at your endpoint

Leave all writing operations to NSABot.
Problems will almost definitely occur if data is added, modified, or removed outside of Slack.

## Future Plans
- [ ] Secure all api interactions
- [x] Use db.js to setup db connections, tables/indexes
- [x] Implement separate user/channel dbs
- [ ] ~~Implement soft delete functionality for messages/channels/users~~
- [x] Add more query option searching (offset, searching, etc)
- [ ] ~~Look into matching JSON API practices~~
- [x] Record slack reactions
- [x] Keep full history of edited messages
- [ ] Clean up/modularize code
- [ ] Typescript
- [ ] Lots more
