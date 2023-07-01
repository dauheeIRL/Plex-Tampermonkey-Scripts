/* globals jQuery, $ */
// ==UserScript==
// @name        check if already have movie on yts
// @namespace   yts checker
// @version     1.0
// @match     http*://yts.torrentbay.net/movies/*
// @grant       none
// @description  check if yts movie is already downloaded into plex
// @updateURL    https://raw.githubusercontent.com/dauheeIRL/Plex-Tampermonkey-Scripts/master/ytsALLmoviecheck.js
// @downloadURL  https://raw.githubusercontent.com/dauheeIRL/Plex-Tampermonkey-Scripts/master/ytsALLmoviecheck.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

(function($) {
    'use strict';

    function UpdateH1Tag(data){

        var strPlexData = new XMLSerializer().serializeToString(data.documentElement);

        if (strPlexData.length > 450){
            var strVideoQual = ' (unknown video quality)';
            if(strPlexData.includes('videoResolution="')){
                strVideoQual = ' (' + strPlexData.split('videoResolution="')[1].split('"')[0] + ')';
            }
            var strFolder = strPlexData.split('librarySectionTitle="')[1].split('"')[0];
            $('h1').after('<h2 style="background-color:yellow;color:red">' + strFolder + strVideoQual + '</h2>');
        }


    }

    function CheckMovie(strSection, TOKEN, SERVER, strMovieName, strYear){

        //get year before and after as there can be a slight mismatch sometimes
        $.get( 'https://' + SERVER + '/library/sections/' + strSection + '/all?X-Plex-Token=' + TOKEN + '&year>=' + (parseInt(strYear) - 1) + '&year<=' + (parseInt(strYear) + 1) + '&title=' + encodeURIComponent(strMovieName), function( data ) {
            UpdateH1Tag(data);
        });

    }

    function CheckPLEXForMovie(){
        const PLEX_TOKEN = 'yMsAwX4HJ31TEdsfNbMy';
        const PLEX_SERVER = '192.168.1.112:32400';
        var strMovieName = $('h1')[0].innerText;
        var strYear = $('h2')[0].innerText;

        CheckMovie(1, PLEX_TOKEN, PLEX_SERVER, strMovieName, strYear);
        CheckMovie(4, PLEX_TOKEN, PLEX_SERVER, strMovieName, strYear);

    }

    $( document ).ready(function() {
        setTimeout(CheckPLEXForMovie, 1000);
    });

})(jQuery);
