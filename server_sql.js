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
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
let http = require('http');
let url = require('url');
let express = require('express');
class Server {
    constructor(db) {
        this.server = express();
        this.port = 8080;
        this.router = express.Router();
        this.dataBase = db;
        this.router.use((request, response, next) => {
            response.header('Content-Type', 'application/json');
            response.header('Access-Control-Allow-Origin', '*');
            response.header('Access-Control-Allow-Headers', '*');
            next();
        });
        this.server.use('/', express.static('./html'));
        this.server.use(express.json());
        this.router.post('/new', this.createHandler.bind(this));
        this.router.post('/definition', [this.errorHandler.bind(this), this.defHandler.bind(this)]);
        this.router.post('/delete', [this.errorHandler.bind(this), this.deleteHandler.bind(this)]);
        this.router.post('/view', [this.errorHandler.bind(this), this.viewHandler.bind(this)]);
        this.router.post('/getDefinitionByLanguage', [this.errorHandler.bind(this), this.getDefHandler.bind(this)]); //take word and language, return definition in that language
        this.router.post('/pronunciation', [this.errorHandler.bind(this), this.pronHandler.bind(this)]); //take word, pronunciation, user address
        this.router.post('/delpronunciation', [this.delpronHandler.bind(this)]); // delete pronunciation according to ID
        this.router.post('/addcomment', this.addCommentHandler.bind(this)); //add comment, takes pronunID, user, text
        this.router.post('/delcomment', this.delCommentHandler.bind(this)); // delete comment by commentID, takes commentID
        this.router.post('/getcomment', this.getCommentHandler.bind(this)); // get all comments by pronunID, takes pronunID
        this.router.post('/getpronunciation', this.getPronuntHandler.bind(this)); // get all comments by word, takes word
        this.router.post('/addPronunLikes', this.addPronunLikesHandler.bind(this)); // get all comments by word, takes word
        this.router.post('*', (request, response) => __awaiter(this, void 0, void 0, function* () {
            response.send(JSON.stringify({ "result": "command-not-found" }));
        }));
        this.server.use('/word', this.router);
    }
    createHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("createHandler request " + request.body.word + " " + request.body.img + " " + request.body.languages + " " + request.body.definition);
            yield this.create(request.body.word, request.body.img, request.body.languages, request.body.definition, response);
        });
    }
    viewHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.view(request.body.word, response);
        });
    }
    defHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateDefinition(request.body.word, request.body.languages, request.body.definition, response);
        });
    }
    deleteHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.delete(request.body.word, response);
        });
    }
    getDefHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getDefinition(request.body.word, request.body.languages, response);
        });
    }
    pronHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addPronunciation(request.body.word, request.body.pron, request.body.addr, request.body.language, request.body.spelling, response);
        });
    }
    delpronHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.delPronunciation(request.body.ID, response);
        });
    }
    errorHandler(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let value = yield this.dataBase.isFound(request.body.word);
            if (!value) {
                console.log('error');
                response.write(JSON.stringify({ 'result': 'error' }));
                response.end();
            }
            else {
                next();
            }
        });
    }
    addCommentHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addcomment(request.body.pronunID, request.body.user, request.body.text, response);
        });
    }
    delCommentHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.delcomment(request.body.commentID, response);
        });
    }
    getCommentHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getComment(request.body.pronunID, response);
        });
    }
    getPronuntHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getPronun(request.body.word, response);
        });
    }
    addPronunLikesHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addLikes(request.body.pronunID, response);
        });
    }
    /*Handlers Ends Here*/
    listen(port) {
        this.server.listen(port);
    }
    create(word, img, languages, definition, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("creating word in create '" + word + "'");
            yield this.dataBase.create(word, img, languages, definition);
            response.write(JSON.stringify({ 'result': 'created',
                'word': word }));
            response.end();
        });
    }
    view(workerData, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('checking word: ' + workerData);
            let info = yield this.dataBase.get(workerData);
            response.write(JSON.stringify({ 'result': 'created',
                'word': workerData,
                'img': info['img'],
                'lang': info['languages'].split(' ')
            }));
            response.end();
        });
    }
    getDefinition(workerData, language, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('get word: ' + workerData + "', language: " + language);
            let info = yield this.dataBase.getDef(workerData, language);
            if (info == null) {
                // no word with specific word being found.
                response.write(JSON.stringify({ 'result': 'error',
                    'word': workerData
                }));
            }
            else {
                let result = { 'result': 'created',
                    'word': workerData,
                    'def': info['def']
                };
                response.write(JSON.stringify(result));
                console.log("definition sent successfully");
            }
            response.end();
        });
    }
    updateDefinition(workerData, lang, def, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("updated word '" + workerData + "' with language '" + lang + "'");
            yield this.dataBase.def(workerData, lang, def);
            let info = yield this.dataBase.get(workerData);
            response.write(JSON.stringify({ 'result': 'updated description',
                'word': workerData,
                'lang': info['languages']
            }));
            response.end();
        });
    }
    delete(workerData, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dataBase.del(workerData);
            response.write(JSON.stringify({ 'result': 'deleted',
                'word': workerData }));
            response.end();
        });
    }
    addPronunciation(word, pron, addr, language, spelling, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("add pronunciation to word '" + word);
            let id = this.dataBase.getNewPronID();
            yield this.dataBase.addPron(id, word, pron, addr, language, spelling);
            response.write(JSON.stringify({ 'result': 'pronunciation added',
                'word': word,
                'id': id
            }));
            response.end();
        });
    }
    delPronunciation(ID, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("delete pronunciation from word '" + worker_threads_1.workerData);
            yield this.dataBase.delPron(ID);
            let info = yield this.dataBase.get(worker_threads_1.workerData);
            response.write(JSON.stringify({ 'result': 'pronunciation deleted',
                'word': worker_threads_1.workerData,
                'id': info['id']
            }));
            response.end();
        });
    }
    addcomment(pronunID, user, text, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("add comment by user '" + user);
            let info = yield this.dataBase.addcomment(pronunID, user, text);
            if (info !== null) {
                response.write(JSON.stringify({ 'result': 'comment added'
                }));
            }
            else {
                response.write(JSON.stringify({ 'result': 'error'
                }));
            }
            response.end();
        });
    }
    delcomment(commentID, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("delete comment ID:" + commentID);
            let info = yield this.dataBase.deletecomment(commentID);
            if (info !== null) {
                response.write(JSON.stringify({ 'result': 'comment deleted',
                    'id': commentID
                }));
            }
            else {
                response.write(JSON.stringify({ 'result': 'error'
                }));
            }
            response.end();
        });
    }
    getComment(pronunID, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('get comment of pronun ' + pronunID);
            let info = yield this.dataBase.getcomment(pronunID);
            if (info == null) {
                // no word with specific word being found.
                response.write(JSON.stringify({ 'result': 'error',
                    'pronunID': pronunID
                }));
            }
            else {
                let result = { 'result': 'success',
                    'comments': info
                };
                response.write(JSON.stringify(result));
                console.log(JSON.stringify(result));
            }
            response.end();
        });
    }
    ////////////////////////////////////////////
    addPronun(word, audio, address, response) {
        return __awaiter(this, void 0, void 0, function* () {
            let info = yield this.dataBase.addPronun(word, audio, address);
            if (info == null) {
                // no word with specific word being found.
                response.write(JSON.stringify({ 'result': 'error',
                    'word': word
                }));
            }
            else {
                let result = { 'result': 'success',
                    'word': word
                };
                response.write(JSON.stringify(result));
                console.log(JSON.stringify(result));
            }
            response.end();
        });
    }
    getPronun(word, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('get pronun of word ' + word);
            let info = yield this.dataBase.getPronun(word);
            if (info == null) {
                // no word with specific word being found.
                console.log('error get Pronun failed');
                response.write(JSON.stringify({ 'result': 'error',
                    'word': word
                }));
            }
            else {
                let result = { 'result': 'success',
                    'pronuns': info
                };
                response.write(JSON.stringify(result));
                console.log(JSON.stringify(result));
            }
            response.end();
        });
    }
    addLikes(pronunID, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('get likes of pronun ' + pronunID);
            let info = yield this.dataBase.addLikes(pronunID);
            if (info == null) {
                // no word with specific word being found.
                response.write(JSON.stringify({ 'result': 'error',
                    'likes': 'error'
                }));
            }
            else {
                let result = { 'result': 'success',
                    'likes': info['likes']
                };
                response.write(JSON.stringify(result));
                console.log(JSON.stringify(result));
            }
            response.end();
        });
    }
}
exports.Server = Server;
