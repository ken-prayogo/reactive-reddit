import config from './../../config';
// Date-Time management
import moment from 'moment';
moment().format();

// Shorten reference
const urlOauth = config.reddit.oauth_url;
// Variables
const subFrontPage = 'FRONTPAGE';

const reddit = {

    // Reddit voting int code
    VOTE_UP: 1,
    VOTE_DOWN: -1,
    VOTE_NEUTRAL: 0,

    /**
     * Get posts in a given subreddit with a specified category
     * @param {string} subreddit
     * @param {string} category
     * @param {string} token - In case oauth is needed (e.g. Frontpage)
     * @param {args} params
     * @returns object
     */
    getSubredditPosts: function (subreddit = config.api.subs.default, category = config.api.sub_category_default, token = null, args = {}) {
        category = category || config.api.sub_category_default;
        // Detect "frontpage"
        if (subreddit.toUpperCase() === subFrontPage && token) {
            return this.getUserFrontPage(token);
        }
        let uri = `${config.reddit.subreddit_prefix}/${subreddit}/${category}.json`;
        let i = 0;
        for (const key in args) {
            // ? or &
            if (i === 0) { uri += '?'; }
            uri += '&';
            uri += `${key}=${args[key]}`;
            i++;
        }
        return this.getPosts(uri);
    },

    /**
     * Gets the user's Frontpage
     * @param {string} token - The access token
     * @returns object
     */
    getUserFrontPage: function (token) {
        const args = {
            method: 'GET',
            headers: {
                Authorization: 'bearer ' + token
            }
        };
        return this.getPosts(urlOauth, args);
    },

    /**
     * Generic function to call a GET to retrieve reddit posts and then
     * massages the data received for the app.
     * @param {!string} uri - A valid URI to retrieve from
     * @param {string} - An object containing call parameters (e.g. method, headers)
     * @returns object
     */
    getPosts: function (uri, args = { method: 'GET' }) {
        return new Promise((resolve, reject) => {
            fetch(uri, args)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        return reject('The network did not respond');
                    }
                })
                .then((json) => {
                    if (json.error) {
                        return reject(json.error + ' ' + json.message);
                    }
                    for (const post of json.data.children) {
                        post.data.custom = this.buildCustomProps(post.data);
                        post.data.title = this.decodeHtml(post.data.title); // Decode special characters
                    }
                    resolve(json.data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },

    /**
     * Sends a POST request to vote on the specified Reddit Post
     * on the user's behalf
     * @param {string} postName - Full name of a "thing" or post
     * @param {string} token - Access token
     * @param {int} dir - 1, 0, or -1
     * @returns object
     */
    votePost: function (postName, token, dir) {
        return new Promise((resolve, reject) => {
            const args = {
                method: 'POST',
                headers: {
                    Authorization: 'bearer ' + token
                }
            };
            fetch(`${urlOauth}/api/vote?id=${postName}&dir=${dir}&rank=2`, args)
                .then(res => res.json())
                .then((json) => {
                    if (json.error) {
                        return reject(json.error + ' ' + json.message);
                    }
                    resolve(json);
                })
                .catch(err => reject(err));
        });
    },

    /**
     * Gets the user's info
     * @param {string} token
     * @returns object
     */
    getUserInfo: function (token) {
        return new Promise((resolve, reject) => {
            const args = {
                headers: {
                    Authorization: 'bearer ' + token
                }
            };
            const uri = `${urlOauth}/api/v1/me`;
            let user = null;
            fetch(uri, args)
                .then(res => res.json())
                .then((userData) => {
                    user = userData;
                    return fetch(uri + '/prefs', args);
                })
                .then(res => res.json())
                .then((prefs) => {
                    user = { ...user, prefs };
                    return fetch(urlOauth + '/subreddits/mine/subscriber?limit=100', args);
                })
                .then(res => res.json())
                .then((subs) => {
                    user = { ...user, subs: this.flattenSubredditList(subs) };
                    resolve(user);
                })
                .catch(err => reject(err));
        });
    },

    /**
     * Flattens the subreddit Listing object into a flat array
     * of subreddit names
     * @param {!object} subs
     * @returns array
     */
    flattenSubredditList: function (subs) {
        const result = [];
        for (const item of subs.data.children) {
            result.push(item.data.display_name);
        }
        return result.sort();
    },

    // Redirect to Reddit to request an access token
    requestToken: function () {
        const unique = new Date().getUTCMilliseconds();
        const authString = `client_id=${config.api.credentials.client}&response_type=token&state=${unique}
            &redirect_uri=${config.api.credentials.app_uri}&scope=${config.api.oauth.scopes}`;
        window.location.href = 'https://www.reddit.com/api/v1/authorize?' + authString;
    },

    /**
     * Adds our own "Custom" data to the Post for simplified logic.
     * Is this a media content? Is there anything embedded? Can it expand? etc.
     */
    buildCustomProps: function (postData) {
        let canExpand = true;
        const type = this.getPostClassification(postData);
        const isMedia = this.isTypeMedia(type);
        const timePosted = this.getTimePostedPhrase(postData.created);
        let mediaPreviewUrl = null;
        let mediaEmbed = null;
        let textHtml = null;
        // Determine media rreview source
        if (isMedia) {
            const mediaSource = this.getMediaSource(postData);
            mediaPreviewUrl = mediaSource.mediaPreviewUrl;
            mediaEmbed = mediaSource.mediaEmbed;
        }
        // Block certain posts from expanding
        if (this.postCannotExpand(postData, type)) {
            canExpand = false;
        }
        // Format textHtml if any
        if (type === 'text') {
            textHtml = { __html: this.decodeHtml(postData.selftext_html) };
        }
        return {
            canExpand, type, isMedia, mediaPreviewUrl, mediaEmbed,
            textHtml, userVote: this.VOTE_NEUTRAL, timePosted
        };
    },

    /**
     * Necessary to dig through Reddit's post object and determine
     * where the hell we can get a media's source url..
     * The post.url doesn't always work, and embedded media is treated differently.
     * Imgur links cannot be directly used as <img> src.
     */
    getMediaSource: function (postData) {
        const isGif = this.isGif(postData);
        const isMediaPreview = this.isMediaPreview(postData);
        const isMediaEmbed = this.isMediaEmbed(postData);
        const type = this.getPostClassification(postData);
        let mediaPreviewUrl = null;
        let mediaEmbed = null;
        if (type === 'media-embed' || (type === 'media' && isGif)) {
            let embedUrl = postData.preview.images[0];
            if (isMediaEmbed) {
                mediaEmbed = { __html: this.decodeHtml(postData.media_embed.content) };
            } else if (isGif && embedUrl.variants.gif) {
                embedUrl = embedUrl.variants.gif.source.url;
            } else {
                embedUrl = embedUrl.source.url;
            }
            mediaPreviewUrl = this.decodeHtml(embedUrl);
        } else if (isMediaPreview) {
            mediaPreviewUrl = postData.preview.images[0].source.url;
        } else {
            mediaPreviewUrl = postData.url;
        }
        return { mediaPreviewUrl, mediaEmbed };
    },

    /**
     * Some "links" are actually images/embedded videos..
     * Videos can either be Gifs or embedded...
     */
    getPostClassification: function (postData) {
        if (this.isMediaEmbed(postData)) {
            return 'media-embed';
        }
        switch (postData.post_hint) {
            case 'link':
                if (this.isGif(postData) || this.isMediaPreview(postData)) {
                    return 'media';
                }
                return 'link';
            case 'self':
                return 'text';
            case 'image':
            case 'rich:video':
            case 'video':
                return 'media';
            default:
                return 'text';
        }
    },

    // Text posts without a "selftext", and links without a thumbnail won't have a "body"
    postCannotExpand: function (postData, type) {
        if (type === 'text' && !postData.selftext_html) {
            return true;
        } else if (type === 'link') {
            return true;
        }
        return false;
    },

    // Determines if the format of the URL media is GIF
    isGif: function (postData) {
        const hasGifLink = postData.preview.images[0].variants.gif;
        return postData.url.indexOf('.gif') > -1 || hasGifLink;
    },

    // Determines if the a media preview is enabled (imgur is a little different)
    isMediaPreview: function (postData) {
        return postData.preview.enabled || postData.domain.indexOf('imgur') > -1;
    },

    // Determines if there is an embedded media HTML we can use
    isMediaEmbed: function (postData) {
        if (postData.media_embed && Object.keys(postData.media_embed).length > 0) {
            return true;
        }
        return false;
    },

    // Determines if there is an embedded media HTML we can use
    isTypeMedia: function (type) {
        const mediaTypes = ['media', 'media-embed'];
        return mediaTypes.indexOf(type) > -1;
    },

    /**
     * Funky solution to decoding special HTML entities.
     * Preserves tags too
     * http://stackoverflow.com/a/7394787
     */
    decodeHtml: function (html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    },

    /**
     * Generates the phrase for when a post was created.
     * @param {float} created - The created unix timestamp for a post
     */
    getTimePostedPhrase: function (created) {
        const now = moment();
        const createDate = moment(created, 'X');

        const daysDiff = Math.abs(createDate.clone().diff(now, 'days'));
        if (daysDiff >= 1) {
            return `${daysDiff} day(s)`;
        }
        const hoursDiff = Math.abs(createDate.clone().diff(now, 'hours'));
        if (hoursDiff >= 1) {
            return `${hoursDiff} hour(s)`;
        }

        const minutesDiff = Math.abs(createDate.clone().diff(now, 'minutes'));
        if (minutesDiff >= 1) {
            return `${minutesDiff} minute(s)`;
        } else {
            return 'less than a minute';
        }
    }

};

export default reddit;
