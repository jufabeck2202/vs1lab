//fragen:
//static
//git
//respnes


/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');
var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN
//path schaut automatich in views nach
//app.use(express.static("gta"));
app.use(express.static("public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// TODO: CODE ERGÄNZEN
function GeoTag(latitude,longitude,name,hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
}




/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

// TODO: CODE ERGÄNZEN

var geoTags =  [];

//adds geo tag
function addGeoTag (gt){
    geoTags.push(gt)
}
//finds name
function searchGtName (name){
   return geoTags.filter(function (gt){return gt.name === name});
}
//delete function, filters all elements exept the one you wanted to delete
function deleteGt(gt){
     geoTags = geoTags.filter(function(el) { return el.name !==gt.name; });

}
//filters all GeoTags inside a radius (x-center_x)^2 + (y - center_y)^2 < radius^2
function searchGtWithCenter(center_lat,center_long,rad){
    return geoTags.filter(function(el) {
        return Math.sqrt(el.latitude-center_lat)+
            Math.sqrt(el.longitude-center_long)<=Math.sqrt(rad)});
}

function searchGt(gt,rad){
    return searchGtWithCenter(gt.latitude,gt.longitude,rad);
}
var testGt = new GeoTag(1,1,"Name1","#bc");
addGeoTag(testGt);
var testGt2 = new GeoTag(112,11212,"nameTest","#ab");
addGeoTag(testGt2);


/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

function createMainPage(req ,res, next){

        res.render("gta.ejs",{
           taglist:geoTags
        });

    next();
}


app.get('/', createMainPage);
app.post('/tagging', saveGt, createMainPage);

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

function saveGt(req,res,next) {
    var gt = new GeoTag(req.body.INlatitude,req.body.INlongitude,req.body.INname,req.body.INhashtag);
    addGeoTag(gt);
    next()
}


/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */
app.post('/discovery', filterTags);


function filterTags(req ,res, next){
    console.log(req.body.term);

    var filteredTags = searchGtName(req.body.term);
    console.log(filteredTags);
    res.render("gta.ejs",{
        taglist:filteredTags
    });
}
// TODO: CODE ERGÄNZEN

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
