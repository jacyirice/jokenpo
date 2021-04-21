const userScore_span = document.getElementById('userScore');
const oponenteScore_span = document.getElementById('compScore');
const buttons_div = document.getElementById('bottons_div');
const paperButton_img = document.getElementById('paperButton');
const rockButton_img = document.getElementById('rockButton');
const scissorsButton_img = document.getElementById('scissorsButton');
const result_p = document.getElementById('result');
const jogadas_p = document.getElementById('jogadas');
const scores_p = document.getElementById('scores');
const url_backend = 'jokenp-node.herokuapp.com';
const url_frontend = 'https://jacyirice.github.io/jokenpo/';

// função para traduzir as jogadas
function traduzirJogadas(jogada) {
    switch (jogada) {
        case "paper":
            return "papel";
        case "rock":
            return "pedra";
        case "scissors":
            return "tesoura";
    }
}

// função que envia a jogada pro servidor
function senderJogada(jogadaUsuario) {
    playSocket.send(JSON.stringify({
        'jogada': jogadaUsuario
    }));
}

// event listener !
// adiciono uma função a ser executada se ocorrer um evento que eu determinar no elemento HTML.

function principal() {
    paperButton_img.addEventListener("click", () => senderJogada("paper"));
    rockButton_img.addEventListener("click", () => senderJogada("rock"));
    scissorsButton_img.addEventListener("click", () => senderJogada("scissors"));
}

//formata mensagem do resultado da partida e oculta devidos campos para proxima partida
function result_message(result, score) {
    if (result == 'Empate') {
        buttons_div.hidden = false;
        return result;
    } else if (result == myusername) {
        buttons_div.hidden = false;
        userScore_span.innerText = score;
        return "Você ganhou!";
    } else {
        buttons_div.hidden = true;
        oponenteScore_span.innerText = score;
        return result + " ganhou!";
    }
}

// formata mensagens das minhas jogadas
function jokenpoMy(jogada, username, order, result, score) {
    if (order == 0) {
        buttons_div.hidden = true;
        jogadas_p.innerText = `Você jogou ${jogada}`
        result_p.innerText = `Aguardando oponente!`
    } else {
        buttons_div.hidden = false;
        jogadas_p.hidden = false;
        jogadas_p.innerText += ` e você jogou ${jogada}`
        result_p.innerText = result_message(result, score);
    }
}

// formata mensagens das jogadas do oponente
function jokenpoOponente(jogada, username, order, result, score) {
    if (order == 0) {
        buttons_div.hidden = false;
        jogadas_p.hidden = true;
        jogadas_p.innerText = `${username} jogou ${jogada}`
        result_p.innerText = `Sua vez!`
    } else {
        buttons_div.hidden = false;
        jogadas_p.innerText += ` e ${username} jogou ${jogada}`
        result_p.innerText = result_message(result, score);
    }
}

// pega query da url
function queryObj() {
    var result = {},
        keyValuePairs = location.search.slice(1).split("&");
    keyValuePairs.forEach(function(keyValuePair) {
        keyValuePair = keyValuePair.split('=');
        result[decodeURIComponent(keyValuePair[0])] = decodeURIComponent(keyValuePair[1]) || '';
    });
    return result;
}
var myParam = queryObj();
const roomname = myParam.room || 'teste'
const myusername = myParam.name || 'strange'

const playSocket = new WebSocket(
    'ws://' +
    url_backend
);

playSocket.onclose = function(e) {
    window.location.href = url_frontend;
}

playSocket.onopen = function(e) {
    playSocket.send(JSON.stringify({
        'join': roomname,
        'username': myusername,
    }));
}

playSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.error) {
        alert(data.error);
    } else if (data.message) {
        userScore_span.innerText = 0;
        oponenteScore_span.innerText = 0;
        if (data.jogador != myusername) {
            result_p.innerText = "Aguardando jogada de " + data.jogador
            jogadas_p.innerText = "Aguarde"
            buttons_div.hidden = true;
        } else {
            result_p.innerText = "Sua vez!"
            jogadas_p.innerText = ""
            buttons_div.hidden = false;
        }

    } else {
        let order = data.order;
        let jogada = traduzirJogadas(data.jogada);
        let username = data.username;
        let result = data.result;
        let score = data.score;
        if (username == myusername)
            jokenpoMy(jogada, username, order, result, score)
        else
            jokenpoOponente(jogada, username, order, result, score)
    }
};


principal()