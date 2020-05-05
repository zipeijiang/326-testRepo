'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const database_sql_1 = require("./database_sql");
const server_sql_1 = require("./server_sql");
const theDatabase = new database_sql_1.Database('wojhwndc'); // CHANGE THIS
const theServer = new server_sql_1.Server(theDatabase);
theServer.listen(8080);
