//PACKAGE IMPORTS

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var multer = require('multer')
var url = require('url');

//INSTANCE CREATION

var app = express();
var upload = multer();

//IMPORTING DATA

var animes = require('./animes.json');

//REQUEST LOGGER

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'REQUESTS.log'),
    { flags:'a' }
);

//LETTING EXPRESS USE THE MIDDLEWARES

app.use(morgan('combined', {stream:accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(upload.array());

//SETTING UP PUG

app.set('view engine', 'pug');
app.set('views', './views');

//SERVING index.pug THROUGH /main ROUTE

app.get('/main', (req, res) => {
    res.render('index');
});

//SERVING index.pug THROUGH / ROUTE

app.get('/', (req, res) => {
    res.render('index');
});

//SERVING animes.json DATA THROUGH /list_all_animes ROUTE

app.get('/list_all_anime', (req, res) => {
    res.json(animes);
});

//SERVING animes.json DATA OF SPECIFIC ANIME BASED ON NAME USING SEARCH THROUGH /animeSearch ROUTE*

app.get('/animeSearch', (req, res) => {
    var search = req.query.search;

    search = search.toUpperCase();

    var currAnime = animes.filter(function(anime){
        if(anime.name == search){
            return true;
        }
    });
    if(currAnime.length == 1){
        var animeName = currAnime[0].name;
        var animeRd = currAnime[0].rd;
        var animeType = currAnime[0].type;
        var animeSeasons = currAnime[0].seasons;
        var animeId = currAnime[0].id;

        fs.readFile('101.jpg', (err, data) => {
            if(err){
                console.log(err);
            }
            app.use(express.static('./101.jpg'));
            res.send(`<h3>NAME::::${animeName}<br>RELEASED ON::::${animeRd}<br>TYPE::::${animeType}<br>SEASONS::::${animeSeasons}<br>AnimeLib ID::::${animeId}</h3>`);

        })
    }else{
        res.status(404);
        res.send('404 Not Found');
    }
});

//ADDING ANIME TO animes.json USING GETB REQUEST AND filesystems THROUGH /add_anime ROUTE

app.get('/add_anime', (req, res) => {
    var qq = url.parse(req.url, true);
  
    let name = req.query.name;
    let rd = req.query.rd;
    let type = req.query.type;
    let seasons = req.query.seasons;

    name = name.toUpperCase();

    const animeData = fs.readFileSync('./animes.json');
    const animeJsonData = JSON.parse(animeData);

    let newId = animes[animes.length-1].id+1;

    animeJsonData.push({
        "name":name,
        "rd":rd,
        "type":type,
        "id":newId,
        "seasons":seasons
    });
    fs.writeFileSync('./animes.json', JSON.stringify(animeJsonData));
    res.send(`<h1>SUCCESSFULLY ADDED ANIME</h1><br><br><h3>NAME::::${name}<br>RELEASED ON::::${rd}<br>TYPE::::${type}<br>SEASONS::::${seasons}<br>AnimeLib ID::::${newId}</h3>`);
});

app.get('/about', (req, res) => {
    res.send(`TOTAL NUMBER OF ANIME IN DATABASE:${animes.length}`)
})

app.listen(8080);
