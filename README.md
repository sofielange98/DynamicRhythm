######## Dynamic Rhythm #######
Our course project for Software Development Methods and Tools, Fall 2018

Our app connects to a users Spotify account and allows them to view this visualizer created by [possan](
https://github.com/possan/webgl-spotify-connect-now-playing-screen-example)



while simultaneously manipulating the currently playing music in a player we have created in the browser 
using Spotify's Web Playback SDK. Users can view all of their playlists and play them by double clicking.

When they start playing a playlist, the tracks in that playlist will fill the current tracks section, and they will be able to 
change to a certain track by clicking on it. 

There are also options to play and pause through buttons or with the space bar.
Finally, users can skip to the previous or next song in the current context by using the buttons or with keyboard arrow control.


---- To run on your machine ----

Clone the repository
Change into the DynamicRhythm/DynamicRhythm directory
use node to run app.js, then go to localhost:8888 on Chrome or Firefox (NOTE: You must have a PREMIUM Spotify account for this to work)
Login with Spotify, and you should see all your playlists on the left, a song will begin playing, and you can change to any of your playlists.
The visualizer takes a minute to catch up, so give it time and you should see the album artwork in the middle of the screen.
