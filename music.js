const stream = require('youtube-audio-stream');
const getVideoId = require('get-video-id');
const readline = require('readline');
const {fetchSubreddit} = require('fetch-subreddit');

var videoExists = require('yt-video-exists')
var lame = require('lame');
var Speaker = require('speaker');
var unpipe = require('unpipe');
var playlistIndex = 0;
var playlist = [];
var action = 'stop';
var decoder = new lame.Decoder;
var speaker = new Speaker;
var somestream;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const playNext = function() {
  if(playlistIndex < playlist.length-1) {
    playlistIndex++;
    playSongs();
  } else {
    console.log('you reached the end');
    askSubreddit();
  }
}

const playSongs = function() {
  decoder = new lame.Decoder;
  speaker = new Speaker;
  yout_url = playlist[playlistIndex];
  yout_url_id = getVideoId(yout_url).id;
  youtube_url = "https://www.youtube.com/watch?v=" + yout_url_id;
  console.log(youtube_url);
  try{
    videoExists(yout_url_id, function(youtubeIdExists) {
      stream(youtube_url)
      .pipe(decoder)
      .pipe(speaker)
      .on('finish',function(){
        console.log('song ended');
        playNext();
      });
    });
  } catch (err) {
    playNext();
  }
}



const playYoutubeURL = function(urls) {
  playlist = urls.filter(function(url){
    return(url.indexOf('www.youtu') > -1);
  });
    playSongs();

}

const askSubreddit = function() {
  rl.question('Which sub?\n',(answer)   => {
    fetchSubreddit(answer)
      .then((urls) => playYoutubeURL(urls[0].urls))
      .catch((err) => console.error(err));
  });
}

askSubreddit();

rl.on('line',(input) => {
  if(input === 'skip') {
    decoder.unpipe(speaker);
    speaker.end();
  } else if(input === 'changesub') {
    playlistIndex = 0;
    playlist = [];
    console.log(playlist.length);
    decoder.unpipe(speaker);
    speaker.end();
    decoder = null;
    speaker = null;
    askSubreddit();
  }
  //playNext();
});
