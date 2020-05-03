const url = "https://gentle-fortress-42768.herokuapp.com/word";
import { postData } from './postdata';

function loadWord() {
    (async () => {
        let word = window.location.search.substring(6);
        let doc = document;
        let outputElement =  doc.getElementById("test") as HTMLOutputElement;
        let outputImgElement =  doc.getElementById("wordImg") as HTMLOutputElement;
        let outputLangElement = doc.getElementById("language") as HTMLOutputElement;
        if(outputElement !== null && outputImgElement !== null){
            const data = { 'word' : word}; // -- (1)
            const newURL = url +"/view";
            console.log("wordRead : fetching " + newURL);
            const resp = await postData(newURL,data)
            const j = await resp.json();
            if (j['result'] !== 'error') {	
                var languagelist = j['lang'];
                let langl = '';
                for (let i = 0; i < languagelist.length; i++){
                    langl += '<option value="' + languagelist[i] + '">' + languagelist[i] + '</option>';
                };
                outputImgElement.innerHTML =  "<img class='head' id=wordimg src= " + j['img'] +">";
                outputLangElement.innerHTML = langl;
                outputElement.innerHTML = "<b>"  + word + "</b>";
            } else {
                outputElement.innerHTML = "200: " +  word  + " not found.</b>";
                outputImgElement.innerHTML =  "";
            }	    
        } else{
            outputElement.innerHTML = "200: input word missing.</b>";
            outputImgElement.innerHTML =  "";
        }
    })();
}

export function search(){
    (async () => {
        let doc = document;
        let wordElement = doc.getElementById("searchBar") as HTMLInputElement
        let word = wordElement.value;
        
        if(word !== ''){
            window.location.href = "wordPage.html?name=" + word;
        } else{
            return
        }
    })();
}

export function defRead(){
	(async () => {
        let doc = document;
        let word = window.location.search.substring(6);
        let langElement = doc.getElementById("language") as HTMLSelectElement
        let outputElement =  doc.getElementById("definition")
        if(langElement !== null && outputElement !== null){
            var index= langElement.selectedIndex;
            let lang = langElement.options[index].value;
            console.log("defRead "+word,lang);
            const data = { 'word' : word, 'languages':lang}; // -- (1)
            const newURL = url +"/getDefinitionByLanguage";
            console.log("language definition: fetching " + newURL);
            const resp = await postData(newURL,data);
            const j = await resp.json();
            console.log(j['def']);
            if (j['result'] !== 'error') {	
                outputElement.innerHTML = "<b>"  + j['def']+ "</b>";
                
            } else {
                outputElement.innerHTML = "210: definition in" +  lang  + " not found.</b>";
        
            }	    
        } else{
            console.log("<b> Error.</b>");
        }
    })();
}

export function showDefBar(){
	(async () => {
        let doc = document;
        let barElement = doc.getElementById("defBar");
        if(barElement !== null){
            if (barElement.style.visibility == "visible"){
                barElement.style.visibility="hidden";
            }
            else{
                barElement.style.visibility="visible";
            }
        } else{
            console.log("<b> Error.</b>");
        }
    })();
}

export function addDef(){
	(async () => {
        let doc = document;
        let word = window.location.search.substring(6);
        let langElement = doc.getElementById("add_lang") as HTMLInputElement;
        let defElement =  doc.getElementById("add_def") as HTMLInputElement;
        let outputElement = doc.getElementById("updateStatus") as HTMLOutputElement;
        if(langElement !== null && defElement !== null){
            let lang = langElement.value;
            let def = defElement.value;
            const data = { 'word': word, 'languages': lang, 'definition': def };
            const newURL = url + "/definition"; 
            console.log("language definition: fetching " + newURL);
            const resp = await postData(newURL,data);
            const j = await resp.json();
            console.log(j['def']);
            if (j['result'] !== 'error') {	
                outputElement.innerHTML = "<b> Success! </b>";
                location = location;
            } else {
                outputElement.innerHTML = "210: Error: Updation Failed</b>";
        
            }    
        } else{
            outputElement.innerHTML = "210: input missing.</b>";
        }
    })();
}

window.onload = loadWord;