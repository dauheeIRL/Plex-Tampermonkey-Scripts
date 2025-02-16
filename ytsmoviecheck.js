/* globals jQuery, $ */
// ==UserScript==
// @name        YTS check SINGLE movie from PLEX
// @namespace   yts_checker
// @version     1.2
// @match     http*://yts.torrentbay.net/movies*
// @match     http*://yts.mx/movies*
// @grant       none
// @description  YTS check SINGLE movie from PLEX
// @updateURL    https://raw.githubusercontent.com/dauheeIRL/Plex-Tampermonkey-Scripts/master/ytsmoviecheck.js
// @downloadURL  https://raw.githubusercontent.com/dauheeIRL/Plex-Tampermonkey-Scripts/master/ytsmoviecheck.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

(function($) {
    'use strict';

    function setHistory(status){
        let strMovieName = $('h1')[0].innerText;
        let strYear = $('h2')[0].innerText.split(" ")[0];

        $.get( 'https://xx/movie-check.php?title=' + encodeURIComponent(strMovieName) + '&year=' + strYear + '&status=' + status, function( data ) {
            //updated so reload - consider checking data if doesn't updated as expected
            location.reload();
        });

    }

    //need do it this way to be available in the onclick event due to tampermonkey
    window.setHistory2 = setHistory;

    function UpdateH1Tag(data, strMovieName, intRelated){

        if (data != 'NO'){
            var colour = 'green';
            if (data.startsWith("WATCHED")){
                colour = 'orange';
                //new
                data = '<button onclick="window.setHistory2(\'REMOVE\');" style="background-color:green;color:black">Set UNWATCHED</button>';
            }else if (data.startsWith("REMOVE")){
                colour = 'yellow';
            }
            if(intRelated > -1){
                $('div[id="movie-related"]').find('a').eq(intRelated).css("border", "10px solid " + colour);
            }
        }else{
            colour = 'yellow';
            data = '<button onclick="window.setHistory2(\'WATCHED\');" style="background-color:yellow;color:black">Set WATCHED</button>';
        }

        if(intRelated < 0){
            $('em[class="pull-left"]').after('<h2 style="background-color:' + colour + ';color:black">' + data + '</h2>');
            //$('h1').after('<h2 style="background-color:yellow;color:red">' + strFolder + strVideoQual + '</h2>');
        }

    }

    function CheckMovie(strMovieName, strYear, intRelated, hlnk){

           $.get( 'https://xx/movie-check.php?title=' + encodeURIComponent(strMovieName) + '&year=' + strYear, function( data ) {
               //console.log(strMovieName + ' ' + data + ' ' + hlnk);
               UpdateH1Tag(data, strMovieName, intRelated);

               if (hlnk != ''){

                   $('div[id="movie-related"]').find('a').eq(intRelated).on('mouseout', function () {
                       $.get(hlnk, function( data ) {

                           $('div[id="movie-related"]').find('a').eq(intRelated).off(); //stop from firing again

                           var dat = data.split('<span itemprop="ratingValue">')[1].split('</span>')[0]; //this is the rating
                           var lang = '';

                           if (data.indexOf('<span style="color: #ACD7DE; font-size: 75%;">') > -1){
                               //lang = ' (' + data.split('<span style="color: #ACD7DE; font-size: 75%;">')[1].split('</span>')[0] + ')'; //this is the rating
                               lang = ' NE'; //this is the rating
                           }

                           var overlayText = $("<div></div>").text(dat + lang).css({
                               "position": "absolute",
                               "top": "50%",
                               "left": "50%",
                               "transform": "translate(-50%, -50%)",
                               "color": "red",
                               "font-size": "14px",
                               "background-color": "white",
                               "pointer-events": "none"
                           });

                           // Style the image container
                           $('div[id="movie-related"]').find('a').eq(intRelated).css({
                               "position": "relative",
                               "display": "inline-block"
                           });

                           // Append the overlay text to the image container
                           $('div[id="movie-related"]').find('a').eq(intRelated).append(overlayText);

                           // Style the image
                           $('div[id="movie-related"]').find('a').eq(intRelated).css({
                               "display": "block"
                           });

                           //$('div[id="movie-related"]').find('a').eq(intRelated).append("<p>" + dat + "</p>");
                           //$('div[id="movie-related"]').find('a').eq(intRelated).show().offset(dat);

                           //console.log(hlnk + ' ' + $('span[itemprop="ratingValue"]')[0].innerText);
                       });
                   });


               }



            });

    }

    function splitLastOccurrence(str, substring) {
        const lastIndex = str.lastIndexOf(substring);
        const before = str.slice(0, lastIndex);
        const after = str.slice(lastIndex + 1);
        return [before, after];
}

    function CheckPLEXForMovie(){
        var strMovieName = $('h1')[0].innerText;
        var strYear = $('h2')[0].innerText.split(" ")[0];
        var intCounter = 0;

        $('div[id="movie-related"]').find('a').each(function() {
            var astrDetails = splitLastOccurrence($(this).attr('title'), ' (');

            CheckMovie(astrDetails[0], astrDetails[1].slice(1, -1), intCounter, $(this).attr('href'));
            intCounter+=1;


        });

        //https://192.168.1.xx:32400/library/sections?X-Plex-Token=xxxx to get what sections you want
        CheckMovie(strMovieName, strYear, -1, '');

    }

    $( document ).ready(function() {
        setTimeout(CheckPLEXForMovie, 800);
    });

})(jQuery);
