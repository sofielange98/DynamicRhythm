//Requirements
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var pgp = require('pg-promise')();



/*Spotify API Credentials
 *Initialize the credentials so that we can use the API
 */
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId: '2f3468713bf34f9988ed842da3db60f7',
  clientSecret: 'ec4b99e73655440ead5354fac3b04a76',
  redirectUri: 'http://localhost:8888/callback/'
});
var scopes = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-private',
  'user-read-email',
]
var state = 'state-1'
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
console.log(authorizeURL);

// clientId, clientSecret and refreshToken has been set on the api object previous to this call.
spotifyApi.refreshAccessToken().then(
  function (data) {
    console.log('The access token has been refreshed!');

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function (err) {
    console.log('Could not refresh access token', err);
  }
);


/*Initialize the app
 *
 */
var app = express()



/*Run the app
 *Implement a server.js for this later on
 */
console.log('Listening on 8888');
app.listen(8888);


/*Database
 */

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