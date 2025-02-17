/* globals jQuery, $ */
// ==UserScript==
// @name        check if already have movie on yts
// @namespace   yts_checker
// @version     1.2
// @match     http*://yts.torrentbay.net/movies*
// @match     http*://yts.mx/movies*
// @grant       none
// @description  check if yts movie is already downloaded into plex
// @updateURL    https://raw.githubusercontent.com/dauheeIRL/Plex-Tampermonkey-Scripts/master/ytsmoviecheck.js
// @downloadURL  https://raw.githubusercontent.com/dauheeIRL/Plex-Tampermonkey-Scripts/master/ytsmoviecheck.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

(function($) {
    'use strict';

    function htmlEncode(value) {
        var encodedValue = $('<div />').text(value).html();
        return encodedValue;
    }

    function UpdateH1Tag(data, strMovieName, intRelated){

        var strPlexData = new XMLSerializer().serializeToString(data.documentElement);

        if ((strPlexData.length > 450)&&((strPlexData.includes($('h1')[0].innerHTML))||(intRelated > -1))&&(strPlexData.toLowerCase().includes('"' + htmlEncode(strMovieName.toLowerCase()) + '"'))){
            var strVideoQual = ' (unknown video quality)';
            if(strPlexData.includes('videoResolution="')){
                strVideoQual = ' (' + strPlexData.split('videoResolution="')[1].split('"')[0] + ')';
            }
            var strFolder = strPlexData.split('librarySectionTitle="')[1].split('"')[0];
            if(intRelated < 0){
            $('em[class="pull-left"]').after('<h2 style="background-color:yellow;color:red">' + strFolder + strVideoQual + '</h2>');
            //$('h1').after('<h2 style="background-color:yellow;color:red">' + strFolder + strVideoQual + '</h2>');
            }else{
                $('div[id="movie-related"]').find('a').eq(intRelated).css("border", "5px solid red");
            }
        }

    }

    function CheckMovie(strSection, TOKEN, SERVER, strMovieName, strYear, intRelated){

        //get year before and after as there can be a slight mismatch sometimes
        $.get( 'https://' + SERVER + '/library/sections/' + strSection + '/all?X-Plex-Token=' + TOKEN + '&year>=' + (parseInt(strYear) - 1) + '&year<=' + (parseInt(strYear) + 1) + '&title=' + encodeURIComponent(strMovieName), function( data ) {
            UpdateH1Tag(data, strMovieName, intRelated);
        });

    }

    function splitLastOccurrence(str, substring) {
        const lastIndex = str.lastIndexOf(substring);
        const before = str.slice(0, lastIndex);
        const after = str.slice(lastIndex + 1);
        return [before, after];
}

    function CheckPLEXForMovie(){
        const PLEX_TOKEN = 'xxxx';
        const PLEX_SERVER = '192.168xxx:32400';
        var strMovieName = $('h1')[0].innerText;
        var strYear = $('h2')[0].innerText;
        var intCounter = 0;

        $('div[id="movie-related"]').find('a').each(function() {
            console.log($(this).attr('title'));
            var astrDetails = splitLastOccurrence($(this).attr('title'), ' (');

            CheckMovie(1, PLEX_TOKEN, PLEX_SERVER, astrDetails[0], astrDetails[1].slice(1, -1), intCounter);
            CheckMovie(4, PLEX_TOKEN, PLEX_SERVER, astrDetails[0], astrDetails[1].slice(1, -1), intCounter);
            intCounter+=1;


        });

        //https://192.168.1.112:32400/library/sections?X-Plex-Token=xxxx to get what sections you want
        CheckMovie(1, PLEX_TOKEN, PLEX_SERVER, strMovieName, strYear, -1);
        CheckMovie(4, PLEX_TOKEN, PLEX_SERVER, strMovieName, strYear, -1);

    }

    $( document ).ready(function() {
        setTimeout(CheckPLEXForMovie, 1000);
    });

})(jQuery);
