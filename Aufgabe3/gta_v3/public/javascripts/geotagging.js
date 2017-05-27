/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

/**
 * GeoTagApp Locator Modul
 */
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

    // Hier Google Maps API Key eintragen
    var apiKey = "AIzaSyDuJ_mLGpU8xST2FndEnJ9tJ89PyHi_Nm4";
    //var apiKeyIframe="AIzaSyDUBEEfdMyM8zzA9Sp38wS23pWuDklA6uY";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function (lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 15;

        if (apiKey === "YOUR API KEY HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "";
        if (typeof tags !== 'undefined') tags.forEach(function (tag) {
            tagList += "&markers=%7Clabel:" + tag.name
                + "%7C" + tag.latitude + "," + tag.longitude;
        });


        var map;
        var bounds = new google.maps.LatLngBounds();

        // Display a map on the page
        map = new google.maps.Map(document.getElementById('googleMap'));
        map.setTilt(45);
        //adds current Potiton

        taglist.push({latitude:$("#latitudeCord").val(),longitude:$("#longitudeCord").val(),name:"Current Position"});

        // Display multiple markers on a map
        var infoWindow = new google.maps.InfoWindow(), marker, i;

        // Loop through our array of markers & place each one on the map
        for( i = 0; i < taglist.length; i++ ) {
            console.log(taglist[i])
            var position = new google.maps.LatLng(taglist[i].latitude, taglist[i].longitude);
            bounds.extend(position);
            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: taglist[i].name
            });


            // Allow each marker to have an info window
            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    infoWindow.setContent(taglist[i].name);
                    infoWindow.open(map, marker);
                }
            })(marker, i));

            // Automatically center the map fitting all markers on the screen
            map.fitBounds(bounds);

        }




        map.fitBounds(bounds);
        map.panToBounds(bounds);


        var urlString = "http://maps.googleapis.com/maps/api/staticmap?center="
            + lat + "," + lon + "&markers=%7Clabel:you%7C" + lat + "," + lon
            + tagList + "&zoom=" + zoom + "&size=438x381&sensor=false&key=" + apiKey;

        // console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        update: function () {

            tryLocate(function (position){


                $("#latitude").val(getLatitude(position));
                $("#longitude").val(getLongitude(position));
                $("#latitudeCord").val(getLatitude(position));
                $("#longitudeCord").val(getLongitude(position));

                getLocationMapSrc(getLatitude(position),getLongitude(position))



            },function (msg) {
                alert(msg);
            });

        },

        refresh: function (lat,lon){
            getLocationMapSrc(lat,lon)
        }

    }; // ... Ende öffentlicher Teil
})();




/**
 * $(document).ready wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(document).ready(function () {
    var latitude = $("#latitudeCord").val();
    var longitude = $("#longitudeCord").val();
    var xhr = new XMLHttpRequest();
    console.log(latitude+"+"+longitude)



    if( latitude===""|| longitude=== ""){
        gtaLocator.update();

    }else{
        console.log("update"+latitude+"+"+longitude)
        gtaLocator.refresh(parseFloat(latitude),parseFloat(longitude));
    }

});

