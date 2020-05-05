export class Database {
    private pgp = require('pg-promise')();
    private uri = "postgres://wojhwndc:Yi2Jd5HN3nAcMRvi79-77AFxiSQ1TSaL@drona.db.elephantsql.com:5432/wojhwndc";
    private db: any;
    private dbName : string = "wojhwndc";

    constructor(dbName : string) {
    	this.dbName = dbName;
        this.db = this.pgp(this.uri);
        (async () => {
            
        try {
            await this.db.none('CREATE TABLE IF NOT EXISTS wordTable (word VARCHAR(50) PRIMARY KEY, img VARCHAR(200), views INTEGER DEFAULT 0, languages VARCHAR(200))');
             } catch (e) {
            console.log('wordTable Already created.');
            }
        try {
            await this.db.none('CREATE TABLE IF NOT EXISTS pronTable (id serial NOT NULL PRIMARY KEY, word VARCHAR(50), userID VARCHAR(50), pronunciation VARCHAR(200), address VARCHAR(200), likes integer, FOREIGN KEY (word) REFERENCES wordTable(word));');
             } catch (e) {
            console.log('pronTable Already created.');
            }
        try {
            await this.db.none('CREATE TABLE IF NOT EXISTS userTable (userID VARCHAR(50) PRIMARY KEY)');
             } catch (e) {
            console.log('userTable Already created.');
            }
        try {
            await this.db.none('CREATE TABLE IF NOT EXISTS changelogTable (word VARCHAR(50), userID VARCHAR(200), action VARCHAR(50), date TIMESTAMP, FOREIGN KEY (word) REFERENCES wordTable(word), FOREIGN KEY (userID) REFERENCES userTable(userID))');
             } catch (e) {
            console.log(e);
             }
        try {
            await this.db.none('CREATE TABLE IF NOT EXISTS comment (id serial NOT NULL PRIMARY KEY, pronunID INTEGER, userID VARCHAR(50), text VARCHAR(250), date TIMESTAMP)');
             } catch (e) {
            console.log('comment Already created.');
            }
        })();
    }
    //create a new word or update img of an existing word (doesn't update definition!)
    public async create(word:string, img:string,lang:string,definition:string) : Promise<void>{
        console.log("put: word = " + word + ", img = " + img);

        try {
            await this.db.none('INSERT INTO wordTable(word, img, languages) values ($1, $2, $3)', [word, img, lang]);
            console.log('added word successfully');
        } catch (err) {
            try {
                console.log(err);
                await this.db.none('UPDATE wordTable SET img = $2 WHERE word = $1', [word, img]);
            } catch (err) {
            console.log(err);
            }
        }
        if (lang !== ''){
            try {
                await this.db.none('CREATE TABLE '+ lang +'Table (word VARCHAR(50) REFERENCES wordTable(word) ON DELETE CASCADE, def VARCHAR(400), PRIMARY KEY (word))');
                } catch (e) {
                console.log('Already created.');
                }
            try{
                await this.db.none('INSERT INTO '+ lang +'Table(word, def) values ($1, $2)', [word, definition]);
            } catch (e){
                await this.db.none('UPDATE '+ lang +'Table SET def = $2 WHERE word = $1', [word, definition]);
            }
        } 
    }

    //only work on update session
    // assume word exists
    public async def(word:string, lang:string, def:string): Promise<void> {
        console.log("put: def in" + lang + " for " + word);
        let info = await this.db.one('SELECT * FROM wordTable WHERE word = $1', [word]);
        let list = info.languages.split(' ');
        if (!list.includes(lang)){
            let languages = info.languages + ' ' + lang;
            await this.db.none('UPDATE wordTable SET languages = $2 WHERE word = $1', [word, languages]);
        }
        try {
            await this.db.none('CREATE TABLE '+ lang +'Table (word VARCHAR(50) REFERENCES wordTable(word) ON DELETE CASCADE, def VARCHAR(400), PRIMARY KEY (word))');
            } catch (e) {
            console.log('Already created.');
            }
        try{
            await this.db.none('INSERT INTO '+ lang +'Table(word, def) values ($1, $2)', [word, def]);
        } catch (e){
            console.log('word already has definition in this language.');
    		await this.db.none('UPDATE '+ lang +'Table SET def = $2 WHERE word = $1', [word, def]);
        }
    }

    public async get(word:string): Promise<any>{ //get word, img, languages
        console.log("get: word = " + word);
    try{
        await this.db.none('UPDATE wordTable SET views = views +1 WHERE word = $1',[word]);
    } catch(err){
        console.log(err);
    }
	try {
		let result = await this.db.one('SELECT * FROM wordTable WHERE word = $1', [word]);
	    console.log("get: returned " + JSON.stringify(result));
	    if (result) {
		return result;
	    } else {
		return null;
	    }
	} catch (err) {
	    // Failed search.
	    return null;
	}
    }

    public async getDef(word:string, lang:string): Promise<any>{
        console.log("get: word = " + word + "in language " + lang);
        try {
            let result = await this.db.one('SELECT * FROM '+ lang+'Table WHERE word = $1', [word]);
            console.log("get: returned " + JSON.stringify(result));
            if (result) {
            return result;
            } else {
            return null;
            }
        } catch (err) {
            // Failed search.
            return null;
        }
    }

    public async del(word:string) : Promise<void> { //delete word
        try {
            await this.db.none('DELETE FROM wordTable WHERE word = $1', [word]);
        } catch (err) {
            // Not found.
            console.log('error word not found')
        }
        }

    public async addcomment(pronunID:number, user:string, text:string): Promise<any>{
        try{
            await this.db.none('INSERT INTO comment(pronunID, userID, text) VALUES ($1, $2, $3)', [pronunID, user, text]);
            let result = {'result':'success'};
            return result;
        }catch (err) {
            // Not found.
            console.log(err);
            console.log('error comment insertion failed');
            return null;
        }
    }

    public async deletecomment(id: number): Promise<any>{
        try{
            await this.db.none('DELETE FROM comment WHERE id = $1', [id]);
            let result = {'result':'success'};
            return result;
        }catch (err) {
            // Not found.
            console.log('error comment deletion failed');
            return null;
        }
    }

    public async getcomment(id: number): Promise<any>{
        try{
            let result = await this.db.any('SELECT * FROM comment WHERE pronunID = $1', [id]);
            return result;
        }catch (err) {
            // Not found.
            console.log('error comment retrival failed');
            return null;
        }
    }
////////////////////////
    public async addPronun(word:string, audio:string, address:string):Promise<any>{
        try{
            await this.db.any('INSERT INTO pronunTable(word, userID, pronunciation, address, likes) VALUES ($1,$2,$3,$4,$5)',[word, 'John', audio, address, 0]);
            let result = {'result':'success'};
            return result;
        } catch(err){
            console.log('error pronunciation cannot be added');
            return null;
        }
    }

    public async getPronun(word:string): Promise<any>{
        try{
            let result = await this.db.any('SELECT * FROM pronTable WHERE word = $1', [word]);
            console.log('get pronunciaiton for word: '+word + ' success')
            return result;
        }catch (err) {
            // Not found.
            console.log('error comment deletion failed');
            return null;
        }
    }
    public async addLikes(pronunID:number): Promise<any>{
        try{
            await this.db.none('UPDATE pronTable SET likes = likes +1 WHERE id = $1',[pronunID]);
            let result = await this.db.one('SELECT * FROM pronTable WHERE id = $1', [pronunID]);
            return result;
        }catch (err) {
            // Not found.
            console.log('error add likes failed');
            return null;
        }
    }
///////////////////////////////
    public async isFound(word:string) : Promise<boolean>  {
	console.log("isFound: word = " + word);
	let v = await this.get(word);
	console.log("is found result = " + v);
	if (v === null) {
	    return false;
	} else {
	    return true;
	}
    }
}