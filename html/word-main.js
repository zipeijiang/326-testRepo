(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.client = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
const url = "https://gentle-fortress-42768.herokuapp.com/word"; // NOTE NEW URL
const postdata_1 = require("./postdata");
function postData(url, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            body: JSON.stringify(data)
        });
        return resp;
    });
}
exports.postData = postData;

},{}],2:[function(require,module,exports){
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
const url = "https://gentle-fortress-42768.herokuapp.com/word";
const postdata_1 = require("./postdata");
function loadWord() {
    (() => __awaiter(this, void 0, void 0, function* () {
        let word = window.location.search.substring(6);
        let doc = document;
        let outputElement = doc.getElementById("test");
        let outputImgElement = doc.getElementById("wordImg");
        let outputLangElement = doc.getElementById("language");
        if (outputElement !== null && outputImgElement !== null) {
            const data = { 'word': word }; // -- (1)
            const newURL = url + "/view";
            console.log("wordRead : fetching " + newURL);
            const resp = yield postdata_1.postData(newURL, data);
            const j = yield resp.json();
            if (j['result'] !== 'error') {
                var languagelist = j['lang'];
                let langl = '';
                for (let i = 0; i < languagelist.length; i++) {
                    langl += '<option value="' + languagelist[i] + '">' + languagelist[i] + '</option>';
                }
                ;
                outputImgElement.innerHTML = "<img class='head' id=wordimg src= " + j['img'] + ">";
                outputLangElement.innerHTML = langl;
                outputElement.innerHTML = "<b>" + word + "</b>";
            }
            else {
                outputElement.innerHTML = "200: " + word + " not found.</b>";
                outputImgElement.innerHTML = "";
            }
        }
        else {
            outputElement.innerHTML = "200: input word missing.</b>";
            outputImgElement.innerHTML = "";
        }
    }))();
}
function search() {
    (() => __awaiter(this, void 0, void 0, function* () {
        let doc = document;
        let wordElement = doc.getElementById("searchBar");
        let word = wordElement.value;
        if (word !== '') {
            window.location.href = "wordPage.html?name=" + word;
        }
        else {
            return;
        }
    }))();
}
exports.search = search;
function defRead() {
    (() => __awaiter(this, void 0, void 0, function* () {
        let doc = document;
        let word = window.location.search.substring(6);
        let langElement = doc.getElementById("language");
        let outputElement = doc.getElementById("definition");
        if (langElement !== null && outputElement !== null) {
            var index = langElement.selectedIndex;
            let lang = langElement.options[index].value;
            console.log("defRead " + word, lang);
            const data = { 'word': word, 'languages': lang }; // -- (1)
            const newURL = url + "/getDefinitionByLanguage";
            console.log("language definition: fetching " + newURL);
            const resp = yield postdata_1.postData(newURL, data);
            const j = yield resp.json();
            console.log(j['def']);
            if (j['result'] !== 'error') {
                outputElement.innerHTML = "<b>" + j['def'] + "</b>";
            }
            else {
                outputElement.innerHTML = "210: definition in" + lang + " not found.</b>";
            }
        }
        else {
            console.log("<b> Error.</b>");
        }
    }))();
}
exports.defRead = defRead;
function showDefBar() {
    (() => __awaiter(this, void 0, void 0, function* () {
        let doc = document;
        let barElement = doc.getElementById("defBar");
        if (barElement !== null) {
            if (barElement.style.visibility == "visible") {
                barElement.style.visibility = "hidden";
            }
            else {
                barElement.style.visibility = "visible";
            }
        }
        else {
            console.log("<b> Error.</b>");
        }
    }))();
}
exports.showDefBar = showDefBar;
function addDef() {
    (() => __awaiter(this, void 0, void 0, function* () {
        let doc = document;
        let word = window.location.search.substring(6);
        let langElement = doc.getElementById("add_lang");
        let defElement = doc.getElementById("add_def");
        let outputElement = doc.getElementById("updateStatus");
        if (langElement !== null && defElement !== null) {
            let lang = langElement.value;
            let def = defElement.value;
            const data = { 'word': word, 'languages': lang, 'definition': def };
            const newURL = url + "/definition";
            console.log("language definition: fetching " + newURL);
            const resp = yield postdata_1.postData(newURL, data);
            const j = yield resp.json();
            console.log(j['def']);
            if (j['result'] !== 'error') {
                outputElement.innerHTML = "<b> Success! </b>";
                location = location;
            }
            else {
                outputElement.innerHTML = "210: Error: Updation Failed</b>";
            }
        }
        else {
            outputElement.innerHTML = "210: input missing.</b>";
        }
    }))();
}
exports.addDef = addDef;
window.onload = loadWord;


},{}]},{},[1])(1)
});
