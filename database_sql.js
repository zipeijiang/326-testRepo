"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

Object.defineProperty(exports, "__esModule", { value: true });
class Database {
    constructor(dbName) {
        this.pgp = require('pg-promise')();
        this.uri = "postgres://wojhwndc:Yi2Jd5HN3nAcMRvi79-77AFxiSQ1TSaL@drona.db.elephantsql.com:5432/wojhwndc";
        this.dbName = "wojhwndc";
        this.dbName = dbName;
        this.db = this.pgp(this.uri);
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.none('CREATE TABLE IF NOT EXISTS wordTable (word VARCHAR(50) PRIMARY KEY, img VARCHAR(200), views INTEGER DEFAULT 0, languages VARCHAR(200))');
            }
            catch (e) {
                console.log('wordTable Already created.');
            }
            try {
                yield this.db.none('CREATE TABLE IF NOT EXISTS pronTable (id serial NOT NULL PRIMARY KEY, word VARCHAR(50), userID VARCHAR(50), pronunciation VARCHAR(200), address VARCHAR(200), likes integer, FOREIGN KEY (word) REFERENCES wordTable(word));');
            }
            catch (e) {
                console.log('pronTable Already created.');
            }
            try {
                yield this.db.none('CREATE TABLE IF NOT EXISTS userTable (userID VARCHAR(50) PRIMARY KEY)');
            }
            catch (e) {
                console.log('userTable Already created.');
            }
            try {
                yield this.db.none('CREATE TABLE IF NOT EXISTS changelogTable (word VARCHAR(50), userID VARCHAR(200), action VARCHAR(50), date TIMESTAMP, FOREIGN KEY (word) REFERENCES wordTable(word), FOREIGN KEY (userID) REFERENCES userTable(userID))');
            }
            catch (e) {
                console.log(e);
            }
            try {
                yield this.db.none('CREATE TABLE IF NOT EXISTS comment (id serial NOT NULL PRIMARY KEY, pronunID INTEGER, userID VARCHAR(50), text VARCHAR(250), date TIMESTAMP)');
            }
            catch (e) {
                console.log('comment Already created.');
            }
        }))();
    }
    //create a new word or update img of an existing word (doesn't update definition!)
    create(word, img, lang, definition) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("put: word = " + word + ", img = " + img);
            try {
                yield this.db.none('INSERT INTO wordTable(word, img, languages) values ($1, $2, $3)', [word, img, lang]);
                console.log('added word successfully');
            }
            catch (err) {
                try {
                    console.log(err);
                    yield this.db.none('UPDATE wordTable SET img = $2 WHERE word = $1', [word, img]);
                }
                catch (err) {
                    console.log(err);
                }
            }
            if (lang !== '') {
                try {
                    yield this.db.none('CREATE TABLE ' + lang + 'Table (word VARCHAR(50) REFERENCES wordTable(word) ON DELETE CASCADE, def VARCHAR(400), PRIMARY KEY (word))');
                }
                catch (e) {
                    console.log('Already created.');
                }
                try {
                    yield this.db.none('INSERT INTO ' + lang + 'Table(word, def) values ($1, $2)', [word, definition]);
                }
                catch (e) {
                    yield this.db.none('UPDATE ' + lang + 'Table SET def = $2 WHERE word = $1', [word, definition]);
                }
            }
        });
    }
    //only work on update session
    // assume word exists
    def(word, lang, def) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("put: def in" + lang + " for " + word);
            let info = yield this.db.one('SELECT * FROM wordTable WHERE word = $1', [word]);
            let list = info.languages.split(' ');
            if (!list.includes(lang)) {
                let languages = info.languages + ' ' + lang;
                yield this.db.none('UPDATE wordTable SET languages = $2 WHERE word = $1', [word, languages]);
            }
            try {
                yield this.db.none('CREATE TABLE ' + lang + 'Table (word VARCHAR(50) REFERENCES wordTable(word) ON DELETE CASCADE, def VARCHAR(400), PRIMARY KEY (word))');
            }
            catch (e) {
                console.log('Already created.');
            }
            try {
                yield this.db.none('INSERT INTO ' + lang + 'Table(word, def) values ($1, $2)', [word, def]);
            }
            catch (e) {
                console.log('word already has definition in this language.');
                yield this.db.none('UPDATE ' + lang + 'Table SET def = $2 WHERE word = $1', [word, def]);
            }
        });
    }
    get(word) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("get: word = " + word);
            try {
                yield this.db.none('UPDATE wordTable SET views = views +1 WHERE word = $1', [word]);
            }
            catch (err) {
                console.log(err);
            }
            try {
                let result = yield this.db.one('SELECT * FROM wordTable WHERE word = $1', [word]);
                console.log("get: returned " + JSON.stringify(result));
                if (result) {
                    return result;
                }
                else {
                    return null;
                }
            }
            catch (err) {
                // Failed search.
                return null;
            }
        });
    }
    getDef(word, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("get: word = " + word + "in language " + lang);
            try {
                let result = yield this.db.one('SELECT * FROM ' + lang + 'Table WHERE word = $1', [word]);
                console.log("get: returned " + JSON.stringify(result));
                if (result) {
                    return result;
                }
                else {
                    return null;
                }
            }
            catch (err) {
                // Failed search.
                return null;
            }
        });
    }
    del(word) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.none('DELETE FROM wordTable WHERE word = $1', [word]);
            }
            catch (err) {
                // Not found.
                console.log('error word not found');
            }
        });
    }
    addcomment(pronunID, user, text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.none('INSERT INTO comment(pronunID, userID, text) VALUES ($1, $2, $3)', [pronunID, user, text]);
                let result = { 'result': 'success' };
                return result;
            }
            catch (err) {
                // Not found.
                console.log(err);
                console.log('error comment insertion failed');
                return null;
            }
        });
    }
    deletecomment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.none('DELETE FROM comment WHERE id = $1', [id]);
                let result = { 'result': 'success' };
                return result;
            }
            catch (err) {
                // Not found.
                console.log('error comment deletion failed');
                return null;
            }
        });
    }
    getcomment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.db.any('SELECT * FROM comment WHERE pronunID = $1', [id]);
                return result;
            }
            catch (err) {
                // Not found.
                console.log('error comment retrival failed');
                return null;
            }
        });
    }
    ////////////////////////
    addPronun(word, audio, address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.any('INSERT INTO pronunTable(word, userID, pronunciation, address, likes) VALUES ($1,$2,$3,$4,$5)', [word, 'John', audio, address, 0]);
                let result = { 'result': 'success' };
                return result;
            }
            catch (err) {
                console.log('error pronunciation cannot be added');
                return null;
            }
        });
    }
    getPronun(word) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.db.any('SELECT * FROM pronTable WHERE word = $1', [word]);
                console.log('get pronunciaiton for word: ' + word + ' success');
                return result;
            }
            catch (err) {
                // Not found.
                console.log('error comment deletion failed');
                return null;
            }
        });
    }
    addLikes(pronunID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.none('UPDATE pronTable SET likes = likes +1 WHERE id = $1', [pronunID]);
                let result = yield this.db.one('SELECT * FROM pronTable WHERE id = $1', [pronunID]);
                return result;
            }
            catch (err) {
                // Not found.
                console.log('error add likes failed');
                return null;
            }
        });
    }
    /*
        public async addPron(ID:number, word:string, pronunciation: string, addr:string, lang:string, spelling:string): Promise<void>{ //add pronunciaiton to db, take ID, word spelling, pronunciation, addr
            let db = this.client.db(this.dbName);
            let pronCollection = db.collection('pronCollection');
            console.log("add pronunciation in "+addr+" to word "+word);
            let result = await pronCollection.updateOne({'id':ID},{$set:{'word':word, 'pronunciation':pronunciation, 'address':addr, 'language':lang, 'spelling':spelling}}, { 'upsert' : true } );
            console.log(JSON.stringify(result));
        }
    
        public async delPron(ID:number): Promise<void>{ //add pronunciaiton to db, take ID, word spelling, pronunciation, addr
            let db = this.client.db(this.dbName);
            let pronCollection = db.collection('pronCollection');
            console.log("delete pronunciation with ID "+ID);
            let result = await pronCollection.deleteMany({'id':ID});
            console.log("result = " +JSON.stringify(result));
        }
    */
    isFound(word) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("isFound: word = " + word);
            let v = yield this.get(word);
            console.log("is found result = " + v);
            if (v === null) {
                return false;
            }
            else {
                return true;
            }
        });
    }
}
exports.Database = Database;
