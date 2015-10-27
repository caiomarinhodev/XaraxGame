/**
 * Created by Caio on 06/09/2015.
 */

//------------------------------------------------------------------------------------MODELS ----------------------------------------------------
var msg = "";
var player = {
    nome: "",
    nivel: 0,
    moedas: 0,
    energia: 0,
    gasto: 0,
    first_game: true,
    ganho: 0,
    pontos: 0,
    tempo_de_jogo: 0,
    espaco: {
        arvores: [],
        terreno: {
            nome: "",
            capacidade: 0,
            tamanho: 0,
            vitalidade: 0,
            valor: 0,
            gasto: 0,
            objetos: []
        },
        insumos: {
            insumos_producao: [],
            insumos_energetico: []
        },
        maquinas: []
    },
    show_aviso_vitalidade: false,
    show_aviso_vitalidade_zero: false,
    show_aviso_energia: false,
    show_aviso_energia_zero: false
};


var insumo_producao = {
    nome: "",
    valor: 0,
    incremento: 0,
    local_de_incremento: 0,
    decrementa_vitalidade: false,
    duracao: 0,
    moment_fim: 0,
    status: true,
    imagem: ''
};

var insumo_energetico = {
    nome: "",
    valor: 0,
    incremento: 0,
    status: true,
    decrementa: false,
    imagem: ''
}

var arvore = {
    nome: " ",
    imagem: "",
    preco: 0,
    producao_fruto: 0,
    valor_fruto: 0,
    tempo_de_vida: 0,
    is_arvore: true,
    idade: 0,
    tempo_de_semente: 0,
    data_de_compra: 0,
    status: true
};

var terreno = {
    nome: "",
    capacidade: 0,
    tamanho: 0,
    vitalidade: 0,
    valor: 0,
    gasto: 0,
    objetos: []
}

var maquina = {
    nome: "",
    valor: 1000,
    tempo_de_vida: moment().add(5, 'minutes'),
    data_de_compra: moment(),
    imagem: '',
    status: true
}

var timeout_game;
var interval_check_events = setInterval(function () {
    check_tragedia_natural();
}, 120000);

//arrays de dias da semana e meses do ano em PT.
var dayName = new Array("Domingo", "Segunda", "Terca", "Quarta",
    "Quinta", "Sexta", "Sabado")
var daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var monName = new Array("Janeiro", "Fevereiro", "Marco", "Abril",
    "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
var monthInYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//------------------------------------------------------------- functions ------------------------------------------------------

function startTime() {
    var today = new Date();
    //get hours
    var h = today.getHours();
    //get minutes
    var m = today.getMinutes();
    //get seconds
    var s = today.getSeconds();
    //insert zeros or not
    m = checkTime(m);
    s = checkTime(s);
    //display
    $('#timer').text(h + ":" + m + ":" + s);
    var t = setTimeout(function () {
        startTime()
    }, 500);
}

function initialize_player(moedas) {
    if (get_item_database('player') === null) {
        if(moedas == 0){
            player.nome = email;
            player.moedas = 3000;
            player.energia = 100;
            player.espaco.terreno.nome = "Meu Terreno";
            player.espaco.terreno.tamanho = 2;
            player.espaco.terreno.capacidade = player.espaco.terreno.tamanho - player.espaco.terreno.objetos.length;
            player.espaco.terreno.gasto = 0.1;
            player.espaco.terreno.vitalidade = 100;
            player.espaco.terreno.valor = 0;
            //insumo_producao.nome = 'teste';
            //insumo_producao.decrementa_vitalidade = false;
            //insumo_producao.incremento = 25;
            //insumo_producao.local_de_incremento = 0;
            //insumo_producao.moment_fim = moment().add(1, 'minutes'); test code.
            player.tempo_de_jogo = moment();
        }
    } else {
        player = diserialize_object_database('player');
        player.show_aviso_vitalidade = false;
        player.show_aviso_vitalidade_zero = false;
        player.show_aviso_energia = false;
        player.show_aviso_energia_zero = false;
    }
}


function init_first(email) {
    save_email(email);
    player.nome = email;
    player.moedas = 3000;
    player.energia = 100;
    player.espaco.terreno.nome = "Meu Terreno";
    player.espaco.terreno.tamanho = 2;
    player.espaco.terreno.capacidade = player.espaco.terreno.tamanho - player.espaco.terreno.objetos.length;
    player.espaco.terreno.gasto = 0.1;
    player.espaco.terreno.vitalidade = 100;
    player.espaco.terreno.valor = 0;
    //insumo_producao.nome = 'teste';
    //insumo_producao.decrementa_vitalidade = false;
    //insumo_producao.incremento = 25;
    //insumo_producao.local_de_incremento = 0;
    //insumo_producao.moment_fim = moment().add(1, 'minutes'); test code.
    player.tempo_de_jogo = moment();
    persist_database('player', player);

}


function comprar_terreno(tamanho, valor, gasto) {
    if (verifica_se_player_pode_comprar(valor) && player_tem_energia(10)) {
        player.energia = player.energia - 10;
        player.moedas = player.moedas - parseInt(valor);
        player.pontos = player.pontos + get_pontos_ao_comprar_terreno(terreno);
        verifica_nivel_player();
        set_calcula_ganho_player();
        set_calcula_gasto_player();
        player.espaco.terreno.tamanho += tamanho;
        player.espaco.terreno.valor += valor;
        player.espaco.terreno.vitalidade = 100;
        player.espaco.terreno.gasto = player.espaco.terreno.gasto + gasto;
        player.tempo_de_jogo = moment();
        return persist_database('player', player);
    }
    return false;
}


function comprar_maquina(maquina) {
    if (verifica_se_player_pode_comprar(maquina.valor) && player_tem_energia(10)) {
        player.energia = player.energia - 10;
        player.moedas = player.moedas - parseInt(maquina.valor);
        player.pontos = player.pontos + get_pontos_ao_comprar_maquina(maquina);
        verifica_nivel_player();
        set_calcula_ganho_player();
        set_calcula_gasto_player();
        player.espaco.maquinas.push(maquina);
        player.tempo_de_jogo = moment();
        return persist_database('player', player);
    }
    return false;
}


function comprar_insumo(insumo) {
    if (verifica_se_player_pode_comprar(insumo.valor) && player_tem_energia(10) && vitalidade_terreno_esta_boa()) {
        player.energia = player.energia - 10;
        player.moedas = player.moedas - parseInt(insumo.valor);
        player.pontos = player.pontos + get_pontos_ao_comprar_insumo(insumo);
        player.espaco.insumos.insumos_producao.push(insumo);
        verifica_nivel_player();
        set_calcula_ganho_player();
        set_calcula_gasto_player();
        player.tempo_de_jogo = moment();

        return persist_database('player', player);
    }
    return false;
}


function comprar_insumo_energetico(insumo_energetico) {
    if (verifica_se_player_pode_comprar(insumo_energetico.valor) && vitalidade_terreno_esta_boa()) {
        player.moedas = player.moedas - parseInt(insumo_energetico.valor);
        player.pontos = player.pontos + get_pontos_ao_comprar_insumo(insumo_energetico);
        set_energia_player(insumo_energetico.incremento);
        player.espaco.insumos.insumos_energetico.push(insumo_energetico);
        verifica_nivel_player();
        set_calcula_ganho_player();
        set_calcula_gasto_player();
        player.tempo_de_jogo = moment();
        return persist_database('player', player);
    }
    return false;
}


function comprar_arvore(nome, imagem, preco, producao_fruto, valor_fruto, tempo_de_vida, idade, is_arvore,
                        tempo_de_semente, status) {
    if (verifica_se_player_pode_comprar(preco) && player_tem_energia(10) && vitalidade_terreno_esta_boa()) {
        //def arvore construct
        var arvore = new Object();
        arvore.nome = nome;
        arvore.preco = preco;
        arvore.producao_fruto = producao_fruto;
        arvore.valor_fruto = valor_fruto;
        arvore.imagem = imagem;
        arvore.tempo_de_vida = tempo_de_vida;
        arvore.is_arvore = is_arvore;
        arvore.idade = idade;
        arvore.status = status;
        arvore.tempo_de_semente = tempo_de_semente;
        arvore.data_de_compra = moment();
        //set player attr
        player.energia = player.energia - 10;
        player.moedas = player.moedas - parseInt(preco);
        player.pontos = player.pontos + get_pontos_ao_comprar_arvore(arvore);
        verifica_nivel_player();
        set_calcula_ganho_player();
        set_calcula_gasto_player();
        //insert arvore in list arvores player
        player.espaco.arvores.push(arvore);
        player.tempo_de_jogo = moment();

        return persist_database('player', player);
    }
    return false;
}

//---------------------------------------------------------------------- CONTROLLERS -----------------------------------------------------------
//TRABALHAR POR SEGUNDOS ....

function display_variaveis_player(id_money, id_gasto, id_ganho, id_energy, id_energy_num, id_score, id_level,
                                  money, gasto, ganho, energia, pontos, nivel) {
    $('#' + id_money).text('' + Number(money).toFixed(2));
    $('#' + id_gasto).text('' + Number(gasto * 12).toFixed(2));
    $('#' + id_ganho).text('' + Number(ganho * 12).toFixed(2));
    $('#' + id_energy).attr('value', '' + energia);
    $('#' + id_energy_num).text(energia);
    $('#' + id_score).text('' + pontos);
    $('#' + id_level).text('' + nivel);
}

function timeout_display_constants(id_money, id_gasto, id_ganho, id_energy, id_energy_num, id_score, id_level) {
    call(id_money, id_gasto, id_ganho, id_energy, id_energy_num, id_score, id_level);
    var ti = setTimeout(function () {
        timeout_display_constants(id_money, id_gasto, id_ganho, id_energy, id_energy_num, id_score, id_level);
    }, 5000);
    return ti;
}

function loader(){
    $.mobile.loading( 'show', {
        text: 'Carregando ...',
        textVisible: true,
        theme: 'z',
        html: ""
    });
}

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

$(document).delegate("#page_register", "pageinit", function () {
    $('#btn_registrar').on('click', function () {
        var email = $('#email').val();
        if(validateEmail(email)){
            $.getJSON('http://cors.io/?u=https://serverxaraxgame.herokuapp.com/game/register/' + email, function (data) {
                var result = JSON.parse(JSON.stringify(data));
                console.log(result);
                if (result.nome == email) {
                    save_email(email);
                    if(validateEmail(email)){
                        $('#popup_success_register').popup('open');
                        $.mobile.navigate('index.html');
                    }
                } else {
                    $('#popup_error_register').popup('open');
                }
            });
        }else{
            $('#popup_email_invalido').popup('open');
        }

    });

});

//TODO: IMPLEMENTAR RECORDS VINDO DO BD DE OTHERS USERS.
//TODO: Implementar Refactor to JSON GETS AJAX
//TODO: Implementar save in BD REMOTO a cada 5min, em try catch
//TODO: DESIGN

function update_bd_player(){
    var moedas = Math.round(player.moedas);
    var nivel = Math.round(player.nivel);
    var pontos = Math.round(player.pontos);
    var url_update = 'http://cors.io/?u=https://serverxaraxgame.herokuapp.com/game/update/';
    var email = get_email();
    $.get(url_update + email + '/' + moedas + '/' + nivel + '/' + pontos, function (data) {
        var result = JSON.parse(data);
        console.log(result);
        if (result.hasOwnProperty('moedas')) {
            return true;
        } else {
            $('#popup_error_login').popup('open');
            return false;
        }
    }).fail(function () {
        alert('Houve falha no update! '); // or whatever
        return false;
    });
    //    .done(function() {
    //}).always(function() {
    //});
}


$(document).delegate("#page_login", "pageinit", function () {
    var email = get_email();
    if(email!=undefined && email!='' && email!=' '){
        $('#input_email').val(email);
    }
    $('#btn_entrar').on('click', function () {
        var email = $('#input_email').val();
        var senha = $('#input_senha').val();
        if(navigator.onLine){
            if(valida_credenciais(email, senha)){
                loader();
                var url_login = 'http://cors.io/?u=https://serverxaraxgame.herokuapp.com/game/login/666/';
                $.getJSON(url_login + email, function (data) {
                    var result = JSON.parse(JSON.stringify(data));
                    console.log(result);
                    //Aqui vou diserializar ou do Zero (first) ou não.. do BD mesmo.
                    if (parseInt(result.moedas) == 0) {
                        console.log('moedas == 0');
                        init_first(email);
                        initialize_player(parseInt(result.moedas));
                    } else {
                        console.log('moedas: ' + result.moedas);
                        initialize_player(parseInt(result.moedas));
                    }
                    if(navigator.onLine){
                        $.mobile.loading('hide');
                        update_bd_player();
                        $.mobile.navigate('home.html');
                    }
                }).fail(function () {
                    alert('Usuario nao existe! '); // or whatever
                });

            } else {
                $('#popup_error_login').popup('open');
            }
        }else{
            if(valida_credenciais(email,senha)){
                player = diserialize_object_database('player');
                if(player.moedas != 0 && player.moedas != 3000){
                    initialize_player(player.moedas);
                    $.mobile.navigate('home.html');
                }
            }
        }


    });

});


$(document).delegate("#page_lojamaquinas", "pageinit", function () {
    clearTimeout(timeout_game);
    timeout_game = timeout_display_constants('player_money_maq', 'player_gasto_money_maq', 'player_ganho_money_maq',
        'player_energy_maq', 'player_energy_num_maq', 'player_score_maq',
        'player_level_maq');


    var lista = $('#lista_maquinas');
    player.pontos = player.pontos + get_pontos_por_acao(null);
    lista.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var temp = $(this).data();
            var element = $(this).children()[0].firstElementChild;;
            maquina.data_de_compra = moment();
            maquina.nome = temp.nomenclatura;
            maquina.tempo_de_vida = moment().add(parseInt(temp.tempo), 'minutes');
            maquina.valor = temp.valor;
            maquina.imagem = element.src;
            if (verifica_se_player_pode_comprar(maquina.valor)) {
                $.mobile.changePage("carrinho_buy_maquina.html", {role: "dialog"});
            } else {
                $.mobile.changePage("erro_buy.html", {role: "dialog"});
            }
        });
    });
});


$(document).delegate('#order_buy_maquina', 'pageshow', function () {
    clearTimeout(timeout_game);
    function display_info_produto(maquina) {
        $('#nome_produto').text(maquina.nome);
        $('#valor_produto').text('$ ' + maquina.valor)
        $('#info_produto').html("<p class='space'>Esta Maquina vai limpar seu terreno por um tempo. " +
            "</p>" + "<p class='space'>O aluguel Termina: " + get_tempo_real("dddd, h:mm a", maquina.tempo_de_vida) +
            "</p>");

    }

    display_info_produto(maquina);

    $('#comprar_produto').on('click', function () {
        $('#order_buy_maquina').dialog('close');
        if (try_add_objeto_no_terreno(maquina)) {
            if (comprar_maquina(maquina)) {
                call();
                $.mobile.changePage("success_buy.html", {role: "dialog"});
            } else {
                $.mobile.changePage("erro_buy.html", {role: "dialog"});
            }
        } else {
            $.mobile.changePage("erro_lotacao_terreno.html", {role: "dialog"});
        }

    });

});


$(document).delegate("#page_lojaconstrucao", "pageinit", function () {
    //display_variaveis_player('player_money_cons', 'player_gasto_money_cons', 'player_ganho_money_cons',
    //    'player_energy_cons', 'player_energy_num_cons', 'player_score_cons',
    //    'player_level_cons', player.moedas, set_calcula_gasto_player(), set_calcula_ganho_player(),
    //    player.energia, player.pontos, player.nivel);
    clearTimeout(timeout_game);
    player.pontos = player.pontos + get_pontos_por_acao(null);
    timeout_game = timeout_display_constants('player_money_cons', 'player_gasto_money_cons', 'player_ganho_money_cons',
        'player_energy_cons', 'player_energy_num_cons', 'player_score_cons',
        'player_level_cons');


    var lista = $('#lista_terrenos');

    lista.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var temp = $(this).data();
            terreno.tamanho = temp.tamanho;
            terreno.valor = temp.valor;
            terreno.gasto = temp.gasto;
            if (verifica_se_player_pode_comprar(terreno.valor)) {
                $.mobile.changePage("carrinho_buy_terreno.html", {role: "dialog"});
            } else {
                $.mobile.changePage("erro_buy.html", {role: "dialog"});
            }
        });
    });

});


// Este metodo delega para a pagina Home inicializar com o time
$(document).delegate("#page_home", "pageinit", function () {
    player.pontos = player.pontos + get_pontos_por_acao(null);
    log(player);
    if (player.first_game) {
        $.mobile.changePage("tutorial.html", {role: "dialog"});
        player.first_game = false;
    }
    var now = new Date();
    //insercao da data na tela.
    $('#dia_semana').text(dayName[now.getDay()] + ", " + now.getDate() +
        " de " + monName [now.getMonth()] + " de " +
        now.getFullYear() + ".");
    $('#btn_sair').click(function () {
        loader();
        if(navigator.onLine){
            if(update_bd_player()){
                $.mobile.loading('hide');
                window.location.href = 'index.html';
            }
        }else{
            $.mobile.loading('hide');
            window.location.href = 'index.html';
        }

    });
    startTime();
    //display_variaveis_player('player_money', 'player_gasto_money', 'player_ganho_money', 'player_energy', 'player_energy_num', 'player_score',
    //    'player_level', player.moedas, set_calcula_gasto_player(), set_calcula_ganho_player(),
    //    player.energia, player.pontos, player.nivel);
    clearTimeout(timeout_game);
    timeout_game = timeout_display_constants('player_money', 'player_gasto_money', 'player_ganho_money', 'player_energy',
        'player_energy_num', 'player_score',
        'player_level');
});

$(document).delegate("#success_buy", "pageshow", function () {
    clearTimeout(timeout_game);
    $('#order_buy').dialog('close');
});

$(document).delegate("#erro_lotacao_terreno", "pageshow", function () {
    clearTimeout(timeout_game);
    $('#order_buy').dialog('close');
});

$(document).delegate('#page_meuespaco', 'pageinit', function () {
    player.pontos = player.pontos + get_pontos_por_acao(null);
    //display_variaveis_player('player_money_espaco', 'player_gasto_money_espaco', 'player_ganho_money_espaco',
    //    'player_energy_espaco', 'player_energy_num_espaco', 'player_score_espaco',
    //    'player_level_espaco', player.moedas, set_calcula_gasto_player(), set_calcula_ganho_player(),
    //    player.energia, player.pontos, player.nivel);
    clearTimeout(timeout_game);
    timeout_game = timeout_display_constants('player_money_espaco', 'player_gasto_money_espaco', 'player_ganho_money_espaco',
        'player_energy_espaco', 'player_energy_num_espaco', 'player_score_espaco',
        'player_level_espaco');
    var lista = $('#player_lista_arvores');
    var lista_sementes = $('#player_lista_sementes');
    var lista_terrenos = $('#player_lista_terrenos');
    var lista_insumos = $('#player_lista_insumos');
    var lista_maquinas = $('#player_lista_maquinas');
    var player_arvores = player.espaco.arvores;
    var player_insumos = player.espaco.insumos.insumos_producao;
    var player_maquinas = player.espaco.maquinas;


    player_arvores.forEach(function (arvore) {
        if (arvore.is_arvore && arvore.status) {
            lista.append("<li data-conteudo='" + JSON.stringify(arvore) + "'><a href='#'>" + arvore.nome +
                "</a></li>").listview('refresh');
        } else {
            lista_sementes.append("<li data-conteudo='" + JSON.stringify(arvore) + "'><a href='#'>" +
                arvore.nome + "</a></li>").listview('refresh');
        }

    });

    player_insumos.forEach(function (insumo) {
        if (insumo.status) {
            lista_insumos.append("<li data-conteudo='" + JSON.stringify(insumo) + "'><a href='#'>" + insumo.nome +
                "</a></li>").listview('refresh');
        }
    });

    player_maquinas.forEach(function (maquina) {
        if (maquina.status) {
            lista_maquinas.append("<li data-conteudo='" + JSON.stringify(maquina) + "'><a href='#'>" + maquina.nome +
                "</a></li>").listview('refresh');
        }
    });

    lista_terrenos.append("<li><a href='#'>Meu Terreno</a></li>").listview('refresh');

    lista.listview();
    lista_sementes.listview();
    lista_terrenos.listview();
    lista_insumos.listview();
    lista_maquinas.listview();

    lista.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var data = $(this).data();
            var temp = data.conteudo;
            arvore.nome = temp.nome;
            arvore.preco = temp.preco;
            arvore.imagem = temp.imagem;
            arvore.producao_fruto = temp.producao_fruto;
            arvore.valor_fruto = temp.valor_fruto;
            arvore.tempo_de_vida = temp.tempo_de_vida;
            arvore.is_arvore = temp.is_arvore;
            arvore.idade = temp.idade;
            arvore.tempo_de_semente = temp.tempo_de_semente;
            arvore.data_de_compra = temp.data_de_compra;
            if (arvore != null) {
                $.mobile.changePage("verarvore.html", {role: "dialog"});
            }
        });
    });

    lista_sementes.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var data = $(this).data();
            var temp = data.conteudo;
            arvore.nome = temp.nome;
            arvore.preco = temp.preco;
            arvore.imagem = temp.imagem;
            arvore.producao_fruto = "Semente ainda nao produz!";
            arvore.valor_fruto = "O seu valor sera muito bom, aguarde!";
            arvore.tempo_de_vida = temp.tempo_de_vida;
            arvore.is_arvore = temp.is_arvore;
            arvore.idade = temp.idade;
            arvore.tempo_de_semente = temp.tempo_de_semente;
            arvore.data_de_compra = temp.data_de_compra;
            if (arvore != null) {
                $.mobile.changePage("verarvore.html", {role: "dialog"});
            }
        });
    });

    lista_terrenos.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            $.mobile.changePage("verterreno.html", {role: "dialog"});
        });
    });

    lista_insumos.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var data = $(this).data();
            var temp = data.conteudo;
            insumo_producao.decrementa_vitalidade = temp.decrementa_vitalidade;
            insumo_producao.duracao = temp.duracao;
            insumo_producao.incremento = temp.incremento;
            insumo_producao.local_de_incremento = temp.local_de_incremento;
            insumo_producao.moment_fim = temp.moment_fim;
            insumo_producao.nome = temp.nome;
            insumo_producao.status = temp.status;
            insumo_producao.valor = temp.valor;
            insumo_producao.imagem = temp.imagem;
            if (insumo_producao != null) {
                $.mobile.changePage("verinsumo.html", {role: "dialog"});
            }
        });
    });

    lista_maquinas.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var data = $(this).data();
            var temp = data.conteudo;
            maquina.nome = temp.nome;
            maquina.valor = temp.valor;
            maquina.imagem = temp.imagem;
            maquina.data_de_compra = temp.data_de_compra;
            maquina.status = temp.status;
            maquina.tempo_de_vida = temp.tempo_de_vida;
            if (maquina != null) {
                $.mobile.changePage("vermaquina.html", {role: "dialog"});
            }
        });
    });

});


$(document).delegate('#page_ver_insumo', 'pageshow', function () {
    player.pontos = player.pontos + get_pontos_por_acao(null);
    clearTimeout(timeout_game);
    function agride_natureza(insumo) {
        if (insumo.decrementa) {
            return "Sim";
        } else {
            return 'Nao';
        }
    }

    function display_info_insumo() {
        $('#imagem_insumo').attr('src', insumo_producao.imagem);
        $('#imagem_insumo').attr('width', 100);
        $('#imagem_insumo').attr('height', 100);
        $('#data_fim_insumo').text(get_tempo_real("dddd, h:mm:ss a", moment(insumo_producao.moment_fim)));
        $('#agride_insumo').text(agride_natureza(insumo_producao));
        $('#valor_insumo').text("$ " + insumo_producao.valor);
    }

    display_info_insumo();
});

$(document).delegate('#page_ver_maquina', 'pageshow', function () {
    player.pontos = player.pontos + get_pontos_por_acao(null);
    clearTimeout(timeout_game);
    $('#imagem_maquina').attr('src', maquina.imagem);
    $('#imagem_maquina').attr('width', 100);
    $('#imagem_maquina').attr('height', 100);
    $('#nome_maquina').text(maquina.nome);
    $('#tempo_vida_maquina').text(maquina.tempo_de_vida);
    $('#valor_maquina').text(maquina.valor);
});


$(document).delegate('#page_ver_terreno', 'pageshow', function () {
    player.pontos = player.pontos + get_pontos_por_acao(null);
    clearTimeout(timeout_game);
    $('#capacidade_terreno').text(player.espaco.terreno.capacidade);
    $('#tamanho_terreno').text(player.espaco.terreno.tamanho);
    $('#vitalidade_terreno').attr('value', player.espaco.terreno.vitalidade);
    $('#valor_terreno').text(player.espaco.terreno.valor);
    $('#gasto_terreno').text(player.espaco.terreno.gasto);
    $('#vitalidade_terreno').slider('refresh');
});

$(document).delegate('#page_ver_arvore', 'pageshow', function () {
    player.pontos = player.pontos + get_pontos_por_acao(null);
    clearTimeout(timeout_game);
    function display_info_arvore() {
        $('#imagem_arvore').attr('src', arvore.imagem);
        $('#imagem_arvore').attr('width', 100);
        $('#imagem_arvore').attr('height', 100);
        $('#nome_arvore').text(arvore.nome);
        $('#frutos_arvore').text(arvore.producao_fruto);
        $('#valor_frutos_arvore').text(arvore.valor_fruto);
        $('#data_compra_arvore').text(get_tempo_real("dddd, DD-MM-YYYY, h:mm:ss a", arvore.data_de_compra));
        $('#tempo_arvore').text(get_tempo_real("dddd, DD-MM-YYYY, h:mm:ss a", arvore.tempo_de_vida));
        $('#valor_arvore').text('$ ' + arvore.preco);
    }

    display_info_arvore();
});


$(document).delegate('#order_buy_arvore', 'pageshow', function () {
    clearTimeout(timeout_game);
    function display_info_produto(arvore) {
        if (arvore.is_arvore) {
            $('#nome_produto').text(arvore.nome);
            $('#valor_produto').text('$ ' + arvore.preco)
            $('#info_produto').html("<p class='space'>Esta arvore dara frutos a partir do momento que voce comprar. " +
                "Basta conferir seu total de moedas.</p>" + "<p class='space'>Tempo de Vida: " + get_tempo_real("dddd, h:mm a", arvore.tempo_de_vida) +
                ",</p><p class='space'>Frutos por minuto): " + arvore.producao_fruto + ",</p><p class='space'> Valor fruto(uni.): $ " +
                arvore.valor_fruto + "</p>");
        } else {
            $('#nome_produto').text(arvore.nome);
            $('#valor_produto').text('$ ' + arvore.preco)
            $('#info_produto').html("<p class='space'>Ei,</p><p class='space'>Esta semente um dia vai ser uma arvore e vai dar frutos," +
                " entao espere algumas horinhas.</p>" +
                "<p class='space'>Tempo de Vida: " + get_tempo_real("dddd, h:mm a", arvore.tempo_de_vida) +
                ",</p><p class='space'>Frutos por minuto: " + arvore.producao_fruto + ",</p><p class='space'> Valor fruto(uni.): $ " +
                arvore.valor_fruto + "</p><p class='space'>Tempo de Semente: " + arvore.tempo_de_semente + " horas.</p> ");
        }

    }

    display_info_produto(arvore);

    $('#comprar_produto').on('click', function () {
        $('#order_buy_arvore').dialog('close');
        if (try_add_objeto_no_terreno(arvore)) {
            if (comprar_arvore(arvore.nome, arvore.imagem, arvore.preco, arvore.producao_fruto, arvore.valor_fruto,
                    arvore.tempo_de_vida, arvore.idade, arvore.is_arvore, arvore.tempo_de_semente, arvore.status)) {
                call();
                //display_variaveis_player('player_money_garden', 'player_gasto_money_garden', 'player_ganho_money_garden',
                //    'player_energy_garden', 'player_energy_num_garden', 'player_score_garden',
                //    'player_level_garden', player.moedas, set_calcula_gasto_player(), set_calcula_ganho_player(),
                //    player.energia, player.pontos, player.nivel);
                $.mobile.changePage("success_buy.html", {role: "dialog"});
            } else {
                $.mobile.changePage("erro_buy.html", {role: "dialog"});
            }
        } else {
            $.mobile.changePage("erro_lotacao_terreno.html", {role: "dialog"});
        }

    });

});


$(document).delegate('#order_buy_terreno', 'pageshow', function () {
    clearTimeout(timeout_game);
    function display_info_produto(terreno) {
        $('#nome_produto').text("Aumento de Terreno");
        $('#valor_produto').text('$ ' + terreno.valor);
        $('#info_produto').html("<p class='space'>Ao comprar este terreno, voce estara aumentando sua" +
            " capacidade atual.</p>" + "<p class='space'>Capacidade a aumentar: " + terreno.tamanho +
            ",</p><p class='space'>Gasto deste terreno: " + terreno.gasto + "</p>");

    }

    display_info_produto(terreno);

    $('#comprar_produto').on('click', function () {
        $('#order_buy_terreno').dialog('close');
        if (comprar_terreno(terreno.tamanho, terreno.valor, terreno.gasto)) {
            call();
            $.mobile.changePage("success_buy.html", {role: "dialog"});
        } else {
            $.mobile.changePage("erro_buy.html", {role: "dialog"});
        }
    });

});


$(document).delegate('#order_buy_insumo', 'pageshow', function () {
    clearTimeout(timeout_game);
    function agride_natureza(insumo) {
        if (insumo.decrementa) {
            return "Sim";
        } else {
            return 'Nao';
        }
    }

    function display_info_produto(insumo) {
        $('#nome_produto').text(insumo.nome);
        $('#valor_produto').text('$ ' + insumo.valor);
        $('#info_produto').html("<p class='space'>Comprando este Insumo, voce estara aumentando seus" +
            " ganhos.</p>" + "<p class='space'>Seu Ganho sera de: " + (player.ganho + insumo.incremento) +
            " por segundo.</p><p class='space'>Este insumo agride a natureza? : " + agride_natureza(insumo) + "</p>");

    }

    display_info_produto(insumo_producao);

    $('#comprar_produto').on('click', function () {
        $('#order_buy_insumo').dialog('close');
        if (comprar_insumo(insumo_producao)) {
            call();
            $.mobile.changePage("success_buy.html", {role: "dialog"});
        } else {
            $.mobile.changePage("erro_buy.html", {role: "dialog"});
        }
    });

});

$(document).delegate('#order_buy_energetico', 'pageshow', function () {
    clearTimeout(timeout_game);
    function agride_natureza(insumo) {
        if (insumo.decrementa) {
            return "Sim";
        } else {
            return 'Nao';
        }
    }

    function display_info_produto(insumo) {
        $('#nome_produto').text(insumo.nome);
        $('#valor_produto').text('$ ' + insumo.valor);
        $('#info_produto').html("<p class='space'>Comprando este Insumo, voce estara aumentando sua" +
            " energia.</p>" + "<p class='space'><p class='space'>Este insumo agride a natureza? : " + agride_natureza(insumo) + "</p>");

    }

    display_info_produto(insumo_energetico);

    $('#comprar_produto').on('click', function () {
        $('#order_buy_energetico').dialog('close');
        if (comprar_insumo_energetico(insumo_energetico)) {
            call();
            $.mobile.changePage("success_buy.html", {role: "dialog"});
        } else {
            $.mobile.changePage("erro_buy.html", {role: "dialog"});
        }
    });

});


$(document).delegate('#page_casa_dos_insumos', 'pageinit', function () {
    player.pontos = player.pontos + get_pontos_por_acao(null);
    clearTimeout(timeout_game);
    timeout_game = timeout_display_constants('player_money_casa', 'player_gasto_money_casa', 'player_ganho_money_casa', 'player_energy_casa',
        'player_energy_num_casa', 'player_score_casa',
        'player_level_casa');


    var lista_fertilizantes = $('#lista_fertilizantes');
    var lista_energeticos = $('#lista_energeticos');

    lista_fertilizantes.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var temp = $(this).data();
            var element = $(this).children()[0].firstElementChild;;
            log(element.src);
            insumo_producao.nome = temp.nome;
            insumo_producao.decrementa_vitalidade = temp.decrementa;
            insumo_producao.duracao = temp.duracao;
            insumo_producao.incremento = temp.incremento;
            insumo_producao.imagem = element.src;
            insumo_producao.local_de_incremento = temp.local;
            insumo_producao.moment_fim = moment().add(insumo_producao.duracao, temp.tipoDuracao);
            insumo_producao.status = true;
            insumo_producao.valor = temp.valor;
            if (verifica_se_player_pode_comprar(insumo_producao.valor)) {
                $.mobile.changePage("carrinho_buy_insumo_producao.html", {role: "dialog"});
            } else {
                $.mobile.changePage("erro_buy.html", {role: "dialog"});
            }
        });
    });


    lista_energeticos.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var temp = $(this).data();
            var element = $(this).children()[0].firstElementChild;;
            log(element.src);
            insumo_energetico.nome = temp.nome;
            insumo_energetico.decrementa = temp.decrementa;
            insumo_energetico.incremento = temp.incremento;
            insumo_energetico.imagem = element.src;
            insumo_energetico.status = true;
            insumo_energetico.valor = temp.valor;
            if (verifica_se_player_pode_comprar(insumo_energetico.valor)) {
                $.mobile.changePage("carrinho_buy_insumo_energetico.html", {role: "dialog"});
            } else {
                $.mobile.changePage("erro_buy.html", {role: "dialog"});
            }
        });
    });

});

//$(document).delegate('#zero_vitalidade', 'pageinit', function () {
//    player.espaco.terreno.vitalidade += 1;
//});
//
//$(document).delegate('#aviso_vitalidade', 'pageinit', function () {
//    player.espaco.terreno.vitalidade = 21;
//});

$(document).delegate('#page_garden_shop', 'pageinit', function () {
    player.pontos = player.pontos + get_pontos_por_acao(null);
    //display_variaveis_player('player_money_garden', 'player_gasto_money_garden', 'player_ganho_money_garden',
    //    'player_energy_garden', 'player_energy_num_garden' 'player_score_garden',
    //    'player_level_garden', player.moedas, set_calcula_gasto_player(), set_calcula_ganho_player(),
    //    player.energia, player.pontos, player.nivel);
    clearTimeout(timeout_game);
    timeout_game = timeout_display_constants('player_money_garden', 'player_gasto_money_garden', 'player_ganho_money_garden', 'player_energy_garden',
        'player_energy_num_garden', 'player_score_garden',
        'player_level_garden');


    var lista_arvores = $('#lista_arvores');
    var lista_sementes = $('#lista_sementes');

    lista_arvores.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var temp = $(this).data();
            var element = $(this).children()[0].firstElementChild;
            arvore.nome = temp.nomenclatura;
            arvore.preco = temp.preco;
            arvore.imagem = element.src;
            arvore.producao_fruto = temp.frutos;
            arvore.valor_fruto = temp.precoFruto * 0.2;
            arvore.tempo_de_vida = moment().add(parseInt(temp.tempo), 'days');
            arvore.is_arvore = true;
            arvore.idade = temp.idade;
            arvore.status = true;
            arvore.tempo_de_semente = 0;
            arvore.data_de_compra = moment();
            if (verifica_se_player_pode_comprar(arvore.preco)) {
                $.mobile.changePage("carrinho_buy_arvore.html", {role: "dialog"});
            } else {
                $.mobile.changePage("erro_buy.html", {role: "dialog"});
            }
        });
    });


    lista_sementes.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var temp = $(this).data();
            var element = $(this).children()[0].firstElementChild;;
            arvore.nome = temp.nomenclatura;
            arvore.preco = temp.preco;
            arvore.imagem = element.src;
            arvore.producao_fruto = temp.frutos;
            arvore.valor_fruto = temp.precoFruto * 0.2;
            arvore.tempo_de_vida = moment().add(parseInt(temp.tempo), 'days');
            arvore.is_arvore = false;
            arvore.idade = temp.idade;
            arvore.status = true;
            arvore.tempo_de_semente = temp.horas;
            arvore.data_de_compra = moment();
            if (verifica_se_player_pode_comprar(arvore.preco)) {
                $.mobile.changePage("carrinho_buy_arvore.html", {role: "dialog"});
            } else {
                $.mobile.changePage("erro_buy.html", {role: "dialog"});
            }
        });
    });


});


//----------------------------------------------------------------------------------------------- UTILS ---------------------------------------

function call(id_money, id_gasto, id_ganho, id_energy, id_energy_num, id_score, id_level) {
    verifica_arvores_player();
    verifica_nivel_player();
    verifica_status_insumos_producao();
    verifica_energia_player();
    set_calcula_ganho_player();
    set_calcula_gasto_player();
    player.tempo_de_jogo = moment();
    set_capacidade_terreno();
    active_maquinas();
    player.moedas = player.moedas + player.ganho;
    player.moedas = player.moedas - player.gasto;
    display_variaveis_player(id_money, id_gasto, id_ganho, id_energy, id_energy_num, id_score, id_level, player.moedas, player.gasto,
        player.ganho, player.energia, player.pontos, player.nivel);
    persist_database('player', player);
    verifica_vitalidade_terreno();
}

function verifica_energia_player() {
    if (player_tem_energia(20) == false) {
        if (player.energia > 0 && player.show_aviso_energia == false) {
            $.mobile.changePage("zero_energia.html", {role: "dialog"});
            player.show_aviso_energia = true;
        } else if (player.energia <= 0 && player.show_aviso_energia_zero == false) {
            $.mobile.changePage("zero_energia.html", {role: "dialog"});
            player.show_aviso_energia_zero = true;
        }
    }
}

function verifica_vitalidade_terreno() {
    if (player.espaco.terreno.vitalidade <= 20 && player.espaco.terreno.vitalidade > 0) {
        if (player.show_aviso_vitalidade == false) {
            $.mobile.changePage("aviso_vitalidade.html", {role: "dialog"});
            player.show_aviso_vitalidade = true;
        }
    } else if (player.espaco.terreno.vitalidade <= 0) {
        if (player.show_aviso_vitalidade_zero == false) {
            $.mobile.changePage('zero_vitalidade.html', {role: 'dialog'})
            player.show_aviso_vitalidade_zero = true;
        }
    } else if (player.espaco.terreno.vitalidade > 100) {
        player.espaco.terreno.vitalidade = 100;
    }
}

function vitalidade_terreno_esta_boa() {
    if (player.espaco.terreno.vitalidade == 0) {
        return false;
    } else {
        return true;
    }
}

function player_tem_energia(decremento) {
    var temp = player.energia - decremento;
    if (temp >= 0) {
        return true;
    } else {
        return false;
    }
}

function verifica_arvores_player() {
    if (player.espaco.arvores.length > 0) {
        player.espaco.arvores.forEach(function (arvore) {
            if (arvore.is_arvore == false) {
                set_check_semente_is_arvore(arvore);
            } else {
                set_check_arvore_to_morte(arvore);
            }
        });
    }
}

//for LOGGER info
function get_tempo_real(format, tempo) {
    var temp = moment(tempo).format(format);
    return formata_data_string_to_pt(temp);
}

function formata_data_string_to_pt(str) {
    for (var i = 0; i < daysInWeek.length; i++) {
        if (str.search(daysInWeek[i]) != -1) {
            str = str.replace(daysInWeek[i], dayName[i]);
            return str;
        }
    }
}

function set_check_semente_is_arvore(arvore) {
    arvore.idade = moment();
    if (arvore.idade >= moment(arvore.data_de_compra).add(arvore.tempo_de_semente, 'minutes')) {
        arvore.is_arvore = true;
        return arvore.is_arvore;
    }
    return arvore.is_arvore;
}

function set_check_arvore_to_morte(arvore) {
    arvore.idade = moment();
    if (arvore.idade >= moment(arvore.tempo_de_vida)) {
        arvore.status = false;
        player.espaco.arvores = removeFunction(player.espaco.arvores, 'imagem', arvore.imagem);
        player.espaco.terreno.objetos = removeFunction(player.espaco.terreno.objetos, 'imagem', arvore.imagem);
        $.mobile.changePage("aviso_arvore_morte.html", {role: "dialog"});
    }
}

//function para persistir dados
function persist_database(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
    return true;
}

function save_email(email) {
    localStorage.setItem('email', email);
    return true;
}

function get_email() {
    return localStorage.getItem('email');
}

//function for get item database
function get_item_database(key) {
    return localStorage.getItem(key);
}

//function to diserialize object
function diserialize_object_database(key) {
    var obj = get_item_database(key);
    return JSON.parse(obj);
}

//function to clean database
function clean_database() {
    localStorage.clear();
}


// funcao para chckar time.
function checkTime(i) {
    if (i < 10) {
        i = "0" + i
    }
    ;  // add zero in front of numbers < 10
    return i;
}

function verifica_se_player_pode_comprar(valor_produto) {
    if (player.moedas >= valor_produto) {
        return true;
    }
    return false;
}

function get_pontos_ao_comprar_arvore(arvore) {
    return 100;
}

function get_pontos_ao_comprar_insumo(insumo) {
    return 35;
}

function get_pontos_ao_comprar_terreno(terreno) {
    return 150;
}

function get_pontos_por_acao(acao) {
    return 1;
}


function get_pontos_ao_comprar_maquina(maquina) {
    return 50;
}

function verifica_nivel_player() {
    if (player.pontos < 1000) {
        player.nivel = 1;
    } else if (player.pontos > 1000 && player.pontos < 2000) {
        player.nivel = 2;
    } else if (player.pontos > 2000 && player.pontos < 3000) {
        player.nivel = 3;
    } else if (player.pontos > 3000 && player.pontos < 4000) {
        player.nivel = 4;
    }else if (player.pontos > 4000 && player.pontos < 5000) {
        player.nivel = 5;
    }else if (player.pontos > 5000 && player.pontos < 6000) {
        player.nivel = 6;
    }else if (player.pontos > 6000 && player.pontos < 7000) {
        player.nivel = 7;
    }else if (player.pontos > 7000 && player.pontos < 8000) {
        player.nivel = 8;
    }else if (player.pontos > 8000 && player.pontos < 9000) {
        player.nivel = 9;
    }else if (player.pontos > 9000 && player.pontos < 10000) {
        player.nivel = 10;
    }else if (player.pontos > 10000 && player.pontos < 11000) {
        player.nivel = 11;
    }else if (player.pontos > 11000 && player.pontos < 12000) {
        player.nivel = 12;
    }else if (player.pontos > 12000 && player.pontos < 13000) {
        player.nivel = 13;
    }else if (player.pontos > 13000 && player.pontos < 14000) {
        player.nivel = 14;
    }else if (player.pontos > 14000 && player.pontos < 15000) {
        player.nivel = 15;
    }else if (player.pontos > 15000 && player.pontos < 20000) {
        player.nivel = 16;
    }else if (player.pontos > 20000 && player.pontos < 25000) {
        player.nivel = 17;
    }else if (player.pontos > 25000 && player.pontos < 30000) {
        player.nivel = 18;
    }
}

function set_calcula_gasto_player() {
    player.gasto = player.espaco.terreno.gasto;
    active_insumos_producao();
    return player.gasto;
}

function set_calcula_ganho_player() {
    var total = 0;
    player.espaco.arvores.forEach(function (arvore) {
        if (arvore.is_arvore && arvore.status == true) {
            total += (arvore.producao_fruto * arvore.valor_fruto);
        }
    });
    player.ganho = total;
    active_insumos_producao();
    return player.ganho;
}

function log(val) {
    console.log(val);
}

function valida_credenciais(email, senha) {
    if (email != "" && senha != "") {
        if (email != " " && senha != " ") {
            console.log('EMAIL: '+get_email());
            if(email == get_email()){
                return true;
            }
        }
    }
    return false;
}

function existe_espaco_no_terreno() {
    if (player.espaco.terreno.capacidade > 0) {
        return true;
    }
    return false;
}

function set_capacidade_terreno() {
    player.espaco.terreno.capacidade = player.espaco.terreno.tamanho - player.espaco.terreno.objetos.length;
}

function try_add_objeto_no_terreno(obj) {
    if (existe_espaco_no_terreno()) {
        player.espaco.terreno.objetos.push(obj);
        set_capacidade_terreno();
        return true;
    }
    return false;
}


function verifica_status_insumos_producao() {
    var lista = player.espaco.insumos.insumos_producao;
    lista.forEach(function (insumo) {
        verifica_status_insumo(insumo);
    });
}


function verifica_status_insumo(insumo) {
    if (moment() >= moment(insumo.moment_fim)) {
        insumo.status = false;
        player.espaco.insumos.insumos_producao = removeFunction(player.espaco.insumos.insumos_producao, 'nome', insumo.nome);
        player.espaco.terreno.objetos = removeFunction(player.espaco.terreno.objetos, 'nome', insumo.nome);
        return insumo.status;
    }
    return insumo.status;
}

function active_insumos_producao() {
    var lista = player.espaco.insumos.insumos_producao;
    lista.forEach(function (insumo) {
        if (verifica_status_insumo(insumo)) {
            if (insumo.local_de_incremento == 0) {
                player.ganho = player.ganho + insumo.incremento;
                if (insumo.decrementa_vitalidade) {
                    player.espaco.terreno.vitalidade = player.espaco.terreno.vitalidade - 20;
                    insumo.decrementa_vitalidade = false;
                }
            } else {
                player.gasto = player.gasto - insumo.incremento;
                if (insumo.decrementa_vitalidade) {
                    player.espaco.terreno.vitalidade = player.espaco.terreno.vitalidade - 20;
                    insumo.decrementa_vitalidade = false;
                }
            }
        }
    });
}

function active_maquinas() {
    var lista = player.espaco.maquinas;
    lista.forEach(function (maquina) {
        if (maquina_is_active(maquina)) {
            player.espaco.terreno.vitalidade = player.espaco.terreno.vitalidade + 15;
            if (maquina.valor >= 1000 && maquina.valor < 2000) {
                player.pontos = player.pontos + 1;
            } else if (maquina.valor >= 2000 && maquina.valor < 3000) {
                player.pontos = player.pontos + 2;
            } else if (maquina.valor >= 3000 && maquina.valor < 4000) {
                player.pontos = player.pontos + 3;
            } else {
                player.pontos = player.pontos + 5;
            }
        }
    });
}

function maquina_is_active(maquina) {
    if (moment() >= moment(maquina.tempo_de_vida)) {
        maquina.status = false;
        player.espaco.maquinas = removeFunction(player.espaco.maquinas, 'nome', maquina.nome);
        player.espaco.terreno.objetos = removeFunction(player.espaco.terreno.objetos, 'nome', maquina.nome);
        $.mobile.changePage("aviso_maquina_aluguel.html", {role: "dialog"});
    } else {
        maquina.status = true;
    }
    return maquina.status;
}

function removeFunction(myObjects, prop, valu) {
    return myObjects.filter(function (val) {
        return val[prop] !== valu;
    });

}

function set_energia_player(incremento) {
    var temp = player.energia + incremento;
    if (player.energia < 100 && temp <= 200) {
        player.energia = temp;
    }

}


//--------------------------------      ------------------------------------------ EVENTS HERE

function set_message_tragedie(msg) {
    $('#message').text(msg);
}


//----tragedies
function event_capacidade_full_and_adubo() {
    var capacidade = player.espaco.terreno.capacidade;
    if (capacidade == 0 && player.espaco.insumos.insumos_producao.length > 0) {
        msg = "Um vendaval ocorreu, e voce gastou muita energia para cuidar de suas plantas! \n" +
            "Infelizmente uma arvore MORREU.";
        player.energia = 10;
        var obj = player.espaco.arvores.pop();
        player.espaco.terreno.objetos = removeFunction(player.espaco.terreno.objetos, 'nome', obj.nome)
        log(msg);
        return true;
    }
    return false;
}

function event_compra_insumo_ilegal() {
    var n = 0;
    player.espaco.insumos.insumos_energetico.forEach(function (insumo) {
        if (insumo.decrementa) {
            n = n + 1;
            player.espaco.insumos.insumos_energetico = removeFunction(player.espaco.insumos.insumos_energetico, 'nome', insumo.nome);
        }
    });
    if (n > 0) {
        msg = "Voce bebeu algum produto industrializado e jogou o lixo no chao, \n" +
            "ocasionando a MORTE de uma arvore.";
        if (player.espaco.arvores.length > 0) {
            var obj = player.espaco.arvores.pop();
            player.espaco.terreno.objetos = removeFunction(player.espaco.terreno.objetos, 'nome', obj.nome)
        }
        return true;
    }
    return false;
}

function event_compra_insumo_producao() {
    var n = 0;
    player.espaco.insumos.insumos_producao.forEach(function (insumo) {
        if (insumo.decrementa_vitalidade) {
            n = n + 1;
        }
    });
    if (n > 0) {
        msg = "Voce andou comprando fertilizante quimico \n" +
            "ou algo do tipo, ocasionando a MORTE de uma arvore.";
        if (player.espaco.arvores.length > 0) {
            var obj = player.espaco.arvores.pop();
            player.espaco.terreno.objetos = removeFunction(player.espaco.terreno.objetos, 'nome', obj.nome);
            player.espaco.terreno.vitalidade = player.espaco.terreno.vitalidade - (player.espaco.terreno.vitalidade * 0.6);
        }
        return true;
    }
    return false;
}

function event_player_is_level_two() {
    if (player.nivel == 2) {
        if (player.moedas > 5000) {
            msg = "Vira-latas invadiram seu terreno, e voce teve que chamar o canil, \n" +
                "gastando metade das suas moedas.";
            player.moedas = player.moedas - (player.moedas * 0.5);
            return true;
        }

    }
    return false;
}


function event_player_is_level_three() {
    if (player.nivel == 3) {
        if (player.moedas > 10000) {
            msg = "Insetos invadiram seu terreno e voce teve que conter o ataque, \n" +
                "gastando todas suas moedas com inseticidas.";
            player.moedas = 0;
            return true;
        }

    }
    return false;
}

function event_tsunami(){
    if(player.nivel == 4){
        if(player.moedas > 10000){
            msg = "Uma gigante onda Tsunami destruiu seu espaco derrubando tudo que voce tinha!";
            player.espaco = {
                arvores: [],
                terreno: {
                    nome: "",
                    capacidade: 0,
                    tamanho: 0,
                    vitalidade: 0,
                    valor: 0,
                    gasto: 0,
                    objetos: []
                },
                insumos: {
                    insumos_producao: [],
                    insumos_energetico: []
                },
                maquinas: []
            };
            return true;
        }
    }
    return false;
}


function check_tragedia_natural() {
    if(event_tsunami()){
        $.mobile.changePage("event.html", {role: "dialog"});
    } else if (event_player_is_level_three()) {
        $.mobile.changePage("event.html", {role: "dialog"});
    } else if (event_compra_insumo_producao()) {
        $.mobile.changePage("event.html", {role: "dialog"});
    } else if (event_player_is_level_two()) {
        $.mobile.changePage("event.html", {role: "dialog"});
    } else if (event_capacidade_full_and_adubo()) {
        $.mobile.changePage("event.html", {role: "dialog"});
    } else if (event_compra_insumo_ilegal()) {
        $.mobile.changePage("event.html", {role: "dialog"});
    }
}

$(document).delegate('#event', 'pageinit', function () {
    set_message_tragedie(msg);
});