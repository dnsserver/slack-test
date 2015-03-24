var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var querystring = require('querystring');
var http = require('http');
var https = require('https');

var app = express();
//var cheerio = require('cheerio');

app.set('http_port', process.env.HTTP_PORT || 3005);
app.set('domain', process.env.HOSTNAME || 'lvh.me');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())    // parse application/json

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');




app.use('/get-content', function(req, res){
  try{
    var destination = url.parse(req.query.url);
    var proto = null;
    switch(destination.protocol){
      case "http:":
        proto = require('follow-redirects').http;
        break;
      case "https:":
        proto = require('follow-redirects').https;
        break;
      default:
        proto = null;
    }
    if(!proto){
      throw new Error('Bad protocol.');
    }
    var method = req.query.method;

    if(method != "get" && method != "post"){
      throw new Error('Bad method.');
    }

    var options = {
      hostname: destination.hostname,
      path: destination.path,
      method: method,
    };

    var external_data = "";
    var external_req = proto.request(options, function(external_res){
      external_res.on('data', function(d){
        external_data += d;
      });
      external_res.on('end', function(){
        //$ = cheerio.load(extenal_data);

        //res.send({content:external_data, summary: 'hello'});
        res.render('data',{data:external_data});
        //res.end();
      });
    });
    external_req.end();
  }catch (error){
    console.log('error',error);
    res.render('error',{error:error});
  }

});

app.use('/', function(req, res){
  res.render('index')
});

var httpServer = http.createServer(app);

httpServer.listen(app.get('http_port'), function(){
	console.log("http server listening on port " + app.get('http_port'));
});
