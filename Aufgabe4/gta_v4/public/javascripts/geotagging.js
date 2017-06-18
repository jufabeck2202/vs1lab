/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...


/**
 * Geo taggint object
 * @param latitude
 * @param longitude
 * @param name
 * @param hashtag
 * @constructor
 */
function GeoTag(latitude, longitude, name, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
}
/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

/**
 * GeoTagApp Locator Modul
 */
var curLat = null;
var curLon = null;

var gtaLocator = (function GtaLocator() {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function (onsuccess, onerror) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onsuccess, function (error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                console.log(error);
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function (position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function (position) {
        return position.coords.longitude;
    };

    var getLocationMapSrc = function (lat, lon, taglist) {

        var map;
        var bounds = new google.maps.LatLngBounds();

        // Display a map on the page
        map = new google.maps.Map(document.getElementById('googleMap'));
        map.setTilt(45);
        //adds current Potiton


        // Display multiple markers on a map
        var infoWindow = new google.maps.InfoWindow(), marker, i;

        // Loop through our array of markers & place each one on the map
        for (i = 0; i < taglist.length; i++) {
            var position = new google.maps.LatLng(taglist[i].latitude, taglist[i].longitude);
            bounds.extend(position);
            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: taglist[i].name
            });


            // Allow each marker to have an info window
            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    infoWindow.setContent(taglist[i].name);
                    infoWindow.open(map, marker);
                }
            })(marker, i));

            // Automatically center the map fitting all markers on the screen
            map.fitBounds(bounds);

        }


        map.fitBounds(bounds);
        map.panToBounds(bounds);

    };

    return { // Start öffentlicher Teil des Moduls ...


        init: function () {

            tryLocate(function (position) {
                curLat = getLatitude(position);
                curLon = getLongitude(position);
                $("#latitude").val(curLat);
                $("#longitude").val(curLon);
                getList();

            }, function (msg) {
                alert(msg);
            });

        },

        refresh: function (taglist) {

            getLocationMapSrc(curLat, curLon, taglist);


        }
// ... Ende öffentlicher Teil
}})();

function updateList(jsonResponse) {
    taglist = JSON.parse(jsonResponse);
    var $discovery = $("#results");
    $discovery.empty();
    gtaLocator.refresh(taglist);
    taglist.forEach(function (gtag) {
        $discovery.append('<li class=list-group-item >' + gtag.name + ' (' + gtag.latitude + ',' + gtag.longitude + ') ' + gtag.hashtag + ' </li>');
    });


}
function getList() {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", 'http://localhost:3000/geotags', true);
    ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    ajax.send();
    ajax.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            updateList(this.responseText);
        }
    }


}
/**
 * $(document).ready wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */

$(document).ready(function () {
    gtaLocator.init();

    $("#tag-form").submit( function () {
        event.preventDefault();
        lat = document.getElementById("latitude").value;
        lon = document.getElementById("longitude").value;
        name = document.getElementById("name").value;
        hash = document.getElementById("hashtag").value;

        var gt = new GeoTag(lat, lon, name, hash);
        var ajax = new XMLHttpRequest();
        ajax.open("POST", "http://localhost:3000/geotags", true);
        ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        ajax.send(JSON.stringify(gt));
        document.getElementById("name").value = "";
        document.getElementById("hashtag").value = "";
        getList();

    });
    //listener for search
    $("#filter-form").submit( function () {
        event.preventDefault();
        var term = document.getElementById("searchterm").value;
        search(term);
    });
    //listener for clear
    document.getElementById("clear").addEventListener("click", function () {
        search();
         document.getElementById("searchterm").value = "";
    });

    function search(term) {
        var ajax = new XMLHttpRequest();
        if(term === undefined)
            ajax.open("GET", 'http://localhost:3000/geotags', true);
        else
            ajax.open("GET", 'http://localhost:3000/geotags?search=' + term, true);
        ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        ajax.send();
        ajax.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                updateList(this.responseText);
            }
        }
    }


});

