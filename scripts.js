// Tweet Search & Onboarding DOM elements
const searchTweet = document.querySelector('[name=search-tweet]');
const searchDiv = document.querySelector('[name=search-bar]')
const embeddedTweet = document.querySelector('[name=embed-tweet]');
const onboardingDiv = document.querySelector('[name=how-to]');

// Information Panel DOM elements
const authorPanel = document.querySelector('[name=author-info]');
const timelinePanel = document.querySelector('[name=author-timeline');
const tweetEmbedPanel = document.querySelector('[name=embed-tweet]');
const tweetLocationPanel = document.querySelector('[name=location-info]');

const displayContentButtons = document.querySelectorAll('.display-content');

// AWS endpoints are set with access control limiting use to tweetcheckr.com domain. If you want to use this code in a new project, you will need to set up new API endpoints leading to your Twitter API calls.
const showTweetEndpoint = 'https://smcku5k2zk.execute-api.us-east-1.amazonaws.com/beta/twitter-api_showtweet';
const embedTweetEndpoint = 'https://smcku5k2zk.execute-api.us-east-1.amazonaws.com/beta/twitter_api_embedtweet';
const showTimelineEndpoint = 'https://smcku5k2zk.execute-api.us-east-1.amazonaws.com/beta/twitter_api_showtimeline';

const geocodingEndpoint = 'https://maps.googleapis.com/maps/api/geocode/json';

var tweetUrl = '';
var tweetId = '';
var tweetEmbedHtml = '';
var tweetAuthor = '';
var tweetData = {};
var authorInfo = {};
var authorTimeline = {};
var map;


// Receives URL from form input, and deconstructs it to get the author's username and the tweet ID, then runs getTweetData to make the API call for the tweet metadata
function getTweetUrl(e) {
    e.preventDefault();
    const text = (this.querySelector('[name=tweet-url]')).value;
    tweetUrl = text;
    const tweetUrlChunks = text.split('/');
    tweetAuthor = tweetUrlChunks[3];
    tweetId = tweetUrlChunks[5];
    getTweetData(tweetId);
    embedTweet(tweetAuthor, tweetId);
}


// Makes API call to get tweet metadata from API Gateway
function getTweetData(tweetId) {
    const url = `${showTweetEndpoint}?id=${tweetId}`;
    fetch(url)
        .then(blob => blob.json())
        .then(function(data) {
            tweetData = JSON.parse(JSON.stringify(data));
            getAuthorInfo(tweetData);
            getAuthorTimeline(tweetAuthor);
            getLocation(tweetData);
        });
}

// Uses the Tweet id to retrieve the embed html code, then loads the code with native Twitter styling
function embedTweet(tweetAuthor, tweetId) {
    const url = `${embedTweetEndpoint}?screen_name=${tweetAuthor}&&id=${tweetId}`;
    fetch(url)
        .then(blob => blob.json())
        .then(function(data) {
            tweetEmbedResponse = JSON.parse(JSON.stringify(data));
            tweetEmbedHtml = tweetEmbedResponse.html;
            tweetEmbedPanel.innerHTML = tweetEmbedHtml;
            // Have to reload tweet to get native Twitter styling
            twttr.widgets.load()
            // Disable the search bar as soon as the tweet is loaded in native styling
            onboardingDiv.classList.add('disabled');
            searchDiv.classList.add('disabled');
        });
}

// Pulls the user metadata from the tweetData and populates the Author Info panel
function getAuthorInfo(tweetData) {
    authorInfo = JSON.parse(JSON.stringify(tweetData.user));

    const authorName = authorInfo.name;
    const authorBio = authorInfo.description;
    const authorHandle = `@${tweetAuthor}`;
    const authorTotalTweets = authorInfo.statuses_count
    const authorFollowers = authorInfo.followers_count;
    const accountCreatedRaw = authorInfo.created_at;
    const accountCreatedDate = new Date(accountCreatedRaw).toDateString();

    var authorContent = document.createElement('ul');
    authorContent.innerHTML = `
        <li>Screen Name: ${authorHandle}</li>
        <li>Name: ${authorName}</li>
        <li>Bio: ${authorBio}</li>
        <br>
        <li> User Account Created: ${accountCreatedDate}</li>
        <br>
        <li>Total Tweets Posted: ${authorTotalTweets}</li>
        <li>Total Followers: ${authorFollowers}</li>
    `
    //Generate Panel Title
    const authorTitle = document.createElement('h3');
    authorTitle.innerHTML = 'Author Information';

    authorPanel.appendChild(authorTitle);
    authorPanel.appendChild(authorContent);
    authorPanel.parentElement.classList.add('active');
}


// Pulls the location information from the tweetData and author metadata and populates the Location Information panel
function getAuthorTimeline(tweetAuthor) {
    const url = `${showTimelineEndpoint}?screen_name=${tweetAuthor}`;
    var timelineContent = document.createElement('ul');
    fetch(url)
        .then(blob => blob.json())
        .then(function(data) {
            authorTimeline = JSON.parse(JSON.stringify(data));
            const timelineHtml = authorTimeline.map(tweet => {
                const tweetTime = tweet.created_at;
                const tweetText = tweet.text;
                return `
                    <li class="timeline-tweet">
                        <span class="date-time">${tweetTime}</span><br>
                        <span class="tweet-text">${tweetText}</span>
                    </li>
                    `;
                }).join('');
            timelineContent.innerHTML = timelineHtml;

            // Generate Panel Title
            const timelineTitle = document.createElement('h3');
            timelineTitle.innerHTML = "Author's Recent Tweets";

            timelinePanel.appendChild(timelineTitle);
            timelinePanel.appendChild(timelineContent);
            timelinePanel.parentElement.classList.add('active');
            });
}

// Retrieve and geolocate the location data from Twitter's API
function getLocation(tweetData) {
    var locationContent = document.createElement('ul');
    var tweetPlace;
    var tweetPlaceCoords;
    var tweetPlaceLong;
    var tweetPlaceLat;
    var authorLocation;

    // If there is a "Place" associated with the tweet, sets up tweetPlaceCoords and lat long based on that geolocation
    if (tweetData.place) {
        tweetPlace = tweetData.place.full_name;
        tweetPlaceCoords = tweetData.place.bounding_box.coordinates;
        tweetPlaceLong = ((tweetPlaceCoords[0][0][0] + tweetPlaceCoords[0][2][0]) / 2);
        tweetPlaceLat = ((tweetPlaceCoords[0][0][1] + tweetPlaceCoords[0][2][1]) / 2);
    } else {
        tweetPlace = 'Not Specified';
        tweetPlaceCoords = null;
        tweetPlaceLong = null;
        tweetPlaceLat = null;
    }
    
    // If the user has a location in their profile, sets up authorLocation variable
    if (tweetData.user.location) {
        authorLocation = tweetData.user.location;
    } else {
        authorLocation = 'No Profile Location';
    }

    // Populate Location Information Panel
    locationContent.innerHTML = `
        <li>Tweet Place: ${tweetPlace}</li>
        <li>Author's Profile Location: ${authorLocation}</li>
    `
    // Generate Panel Title
    const locationTitle = document.createElement('h3');
    locationTitle.innerHTML = "Location Information";

    tweetLocationPanel.appendChild(locationTitle);
    tweetLocationPanel.appendChild(locationContent);
    tweetLocationPanel.parentElement.classList.add('active');

    // If there is a "Place" associated with the tweet, loads the Google Map with those coords, else takes user's profile location and geocodes it, then uses those coords for the map center. If neither location is specified, map is not loaded
    if (tweetData.place) {
        mapTweetPlace(tweetPlaceLat, tweetPlaceLong);
    } else if ((!tweetData.place) && tweetData.user.location) {
        var geocodedResponse;
        var geolocationAddress = authorLocation.replace(/ /g, '+');
        const url = `${geocodingEndpoint}?address=${geolocationAddress}&key=[YOUR-GOOGLE-CLOUD-KEY]`;
        fetch(url)
            .then(blob => blob.json())
            .then(function(data) {
                geocodedResponse = JSON.parse(JSON.stringify(data));
                const authorLat = geocodedResponse.results[0].geometry.location.lat;
                const authorLong = geocodedResponse.results[0].geometry.location.lng;
                mapTweetPlace(authorLat, authorLong);
            });   
    }
    
}


// Initializes Google map element on page (set to display: none by default)
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 82.8628, lng: 135.0000},
      zoom: 10
    });
  }

// Reload the Google map element with the tweet's location data
function mapTweetPlace(tweetPlaceLat, tweetPlaceLong) {
    mapEl = document.getElementById('map');
    const latLng = {lat: parseFloat(tweetPlaceLat), lng: parseFloat(tweetPlaceLong) };
    map = new google.maps.Map(document.getElementById('map'), {
        center: latLng,
        zoom: 10
      });
    mapEl.classList.add('active');
    mapEl.parentElement.classList.add('active');
}

// Display tweet information and hide primers on how to approach each section
function displayContent() {
    const widgetContent = this.parentElement.parentElement.querySelector('.widget-content');
    const primerContent = this.parentElement;
    primerContent.classList.add('hide');
    widgetContent.classList.add('display');
    console.log(widgetContent);
    console.log(primerContent);
}

searchTweet.addEventListener('submit', getTweetUrl);
displayContentButtons.forEach(button => {button.addEventListener('click', displayContent)});