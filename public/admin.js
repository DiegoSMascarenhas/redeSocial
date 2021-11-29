import {ReportCard} from "./components/reportCard/reportCard.js";

let users = [];
document.addEventListener('DOMContentLoaded', config);
/**
 * Configura a página
 */
async function config(){
    checkToken();
    updateSession();
}

function setEventListeners(){
    for(const event of window.graph.events){
        db.ref(`/events/${event}/users`).on("value", snapshot => updateReports(snapshot.val()),  error => console.log(error));
    }
}

function checkToken(){
    var token = sessionStorage.getItem('token');

    if( token == null ||token.length < 226 ){
        window.location.href='/login.html';
    }
}

/**
 * Atualiza a sessão do usuário
 */
async function updateSession() {
    auth.onAuthStateChanged(handleAuthStateChanged);
}
async function handleAuthStateChanged(user) {
    if (user) {
        window.graph = window.graph || {};
        window.graph.id = user.uid;
        window.graph.event = user.uid;
        window.graph.evento = window.graph.event;
        await getAdministrator(user.email);
        setEventListeners();
        activateUserAdministration();

        console.log("User is signed in");
    } else {
        console.log("User is signed out");
    }
}
async function getAdministrator(email){
    return firebase.firestore()
    .collection('administrators')
    .doc(email)
        .get().then((snapshot) => {
            let data =snapshot.data();
            window.graph.events = data.events;
            window.graph.userType = data.userType;
        });
}
/**
 * Carrega a lista de denúncias
 */
async function setReportCards(){
    let reports = users.map((user)=>jsonToArray(user.reports));
    reports = reports.flat();
    reports = reports.filter(report=> report.status.toLowerCase() == "visível");
    reports.forEach(async (data) => {
        let reportCard = new ReportCard();
        await reportCard.setElement(document.querySelector(".report-cards"),data);
        reportCard.setEventListeners();
    })
}
/**
 * Atualiza a lista de denúncias
 */
async function updateReports(data){
    users = jsonToArray(data);
    document.querySelector(".report-cards").innerHTML = null;
    await setReportCards();
}
/**
 * Logout do admin
 */
var btnLogout = document.getElementById('btnLogout');
    btnLogout.addEventListener('click', function () {
      firebase
        .auth()
        .signOut()
        .then(function () {
            sessionStorage.removeItem('token');
            window.location.href='/login.html'
        }, function (error) {
          console.error(error);
        });
    });

/**
 * Ativa administração de usuários
 * @returns 
 */
function activateUserAdministration(){
    if(window.graph.userType!=="administrador"){
        return;
    }
    var btnCreate = document.getElementById('btnCreate');
    var btnNewUser = document.getElementById('btnNewUser');

    btnCreate.addEventListener('click', addUser);
    btnNewUser.addEventListener('click', openModal)
    btnNewUser.removeAttribute("hidden");
}

/**
 * Adiciona um usuário administrador
 */
function addUser() {
    firebase
        .auth()
        .createUserWithEmailAndPassword(userLogin.value, passwordLogin.value)
        .then(function () {
            updateUserCollection();
            closeModal();
        })
        .catch(function (error) {
            updateUserCollection();
            closeModal();
        });
}

/**
 * Abre o modal de cadastro de usuário
 */
function openModal() {
    document.getElementById('modalCadastro').setAttribute('class', 'modal is-active')
}

/**
 * Fecha o modal de cadastro de usuário
 */

function closeModal() {
    document.getElementById('modalCadastro').removeAttribute('class');
    document.getElementById('modalCadastro').setAttribute('class', 'modal')
}

/**
 * Registra lista de eventos que o usuário tem permissão para administrar
 */
async function updateUserCollection() {
    let events = userEvents.value;
    events = events.split("\n");
    firebase.firestore().collection("administrators")
        .doc(userLogin.value)
        .set({
            events: events,
            userType: selectUserType.value
        })
}

async function fitToScreen(){
    document.querySelector("section.container").style["max-height"] = window.innerHeight - 90;
}