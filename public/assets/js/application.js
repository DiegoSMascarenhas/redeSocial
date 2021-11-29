const firebase = window.firebase;

const auth = firebase.auth();
const store = firebase.firestore();

const db = firebase.database();
const storage = firebase.storage();
const urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

window.application = { store,db, storage };

/**
 * Realiza uma leitura de dados no servidor firestore
 */
function testFirestore() {
    store.collection("users").get().then(function (querySnapshot) {
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
        });
    })
        .catch(function (error) {
            console.log(error);
        })
}
/**
 * Realiza uma leitura de dados no servidor database
 */
function testDatabase(){
    db.ref().on('value', snapshot => {
        console.log(snapshot.val());
    });
    db.ref().once('value').then((snapshot) => {
        console.log(snapshot.val());
    });
}
/**
 * Realiza uma leitura de dados no servidor storage
 */
function testStorage() {
    var gsReference = storage.refFromURL('gs://solucaocompleta-c2ce2.appspot.com/images/whatsapp.jpg');
    gsReference.getDownloadURL().then(function (url) {
        console.log(url);
    })
        .catch(function (error) {
            console.log(error.code);
        })
}



/**
 * Recupera uma lista de documentos de um snapshot
 * @param {object} snapshot 
 */
function snapshotToList(snapshot) {
    let list = [];
    let value = snapshot.val();
    for (const field in value) {
        let item = Object.assign({}, value[field], {
            _id: field,
        });
        list.push(item);
    }
    return list;
}
function jsonToArray(object){
    let list = [];
    for (const field in object) {
        let item = Object.assign({}, object[field], {
            _id: field,
        });
        list.push(item);
    }
    return list;
}

/**
 * gera um ID
 */
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function extractLinks(text){
    return [...text.matchAll(urlRegex)];
  }
  /***
   * aplica links no texto do post
   */
  function linkify(text) {
    let ignoreList = ["firebasestorage.googleapis.com","twemoji.maxcdn.com"];
    return text.replace(urlRegex, function(url) {
        let match = ignoreList.find((item)=>url.indexOf(item)>-1)
        if(match){
            return url;
        }
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
}
function unlinkify(text){
    let links = extractLinks(text);
    links.forEach(function(link){
        text = text.split('<a href="' + link[0] + '" target="_blank">' + link[0] + '</a>').join(link[0]);
    })
    return text;
}

/**
 * Recupera o search da URL em formato JSON
 */
function parseSearch() {
	let params = window.location.href.split('?')[1];
	if (!params) {
        return null;
    }
	let result = {};
    if (params.indexOf('?') > -1) {
        params = params.split('?')[1];
    }
    params.split('&').forEach((pair)=>{
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
	return result;
}