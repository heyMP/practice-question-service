# Practice Questions Service

## Getting Started

Run the Backend

```
docker-compose up
```

Visit the Hasura Console http://localhost:8080

Run the Frontend

```
cd components/practice-question
yarn install
yarn start
```

Visit the practice-question web component demo http://localhost:8001/demo/


## Developing in Hasura

Any time we are making changes to the Hasura backend structure (i.e. the database layer)
we need to run Hasura in Console mode.  This will track all changes in our local file system.

Run the console

```
cd hasura
hasura console --admin-secret password
```

A browser window will automatically pop up.  Any changes made in that browser session will be tracked as migration changes in your local file system.

## Applying Hasura Changes

```
cd hasura
hasura migrate apply
```