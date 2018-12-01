
//Requirements
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var pgp = require('pg-promise')();

//Database
const dbConfig = { // CHANGE TO YOUR LOCAL INFO
  host: 'localhost',
  port: 2000,
  database: 'dynamic_rhythm',
  user: 'sofielange98',
  password: '' // TODO: Fill in your PostgreSQL password here.
  // Use empty string if you did not set a password
};
var db = pgp(dbConfig);


//Spotify Client Information
var client_id = '7da0ba282d734fe0ac365644200242a0'; // Your client id
var client_secret = '4e93e5aa845c4501a8cb91ded16dd84e'; // Your secret
var redirect_uri = 'http://localhost:8888/callback/'; // Your redirect uri
var scopes = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state'
];

//Spotify Player Variables


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();
app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());



app.get("/login", function (req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email  playlist-read playlist-read-private playlist-modify playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});



function addNewUser(user) {

  db.any('SELECT count(*) from users where id = $1', [user.id])
    .then(data => {
      console.log(data),
        console.log(data[0].count);
      if (data[0].count >= 1) {
        console.log('User already in database')
      } else { //add user to database if they aren't already in there
        var query =
          'INSERT INTO users(id, email, name, country, uri) VALUES($1, $2, $3, $4, $5)'
        db.one(query, [user.id, user.email, user.display_name, user.country, user.uri])
          .then(data => {
            console.log(data.id); // print new user id;
          })
          .catch(function (error) {
            console.log('woopsie!');
          })
      }
    })
    .catch(function (error) {
      console.log('error')
    })

}

app.get('/callback', function (req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          console.log(body);
          var user = body;
          console.log(user.email);
          console.log(user.id);
          addNewUser(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});


var request = require("request");
var user_id = "1285650559";
var token = "Bearer" + access_token // need a working access token
var playlists_url = "https://api.spotify.com/v1/users/"+user_id+"/playlists"
request({url:playlists_url, headers:{"Authorization":token}}, function(err, res){
  if (res){
    var playlists=JSON.parse(res.body);
    var playlist_url = playlists.items[0].href
    request({url:playlists_url, headers:{"Authorization":token}}, function(err, res){
      if (res){
        var playlist = JSON.parse(res.body);
        console.log("playlists: " + playlist.name);
        playlist.tracks.forEach(function(track){
        console.log(track.track.name);

        });

      }
    })
  }
})


console.log('Listening on 8888');
app.listen(8888);