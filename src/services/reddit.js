import config from './../../config';
/**
 * Date/Time management
 */
import moment from 'moment';
moment().format();

const reddit = {
    VOTE_UP: 1,
    VOTE_DOWN: -1,
    VOTE_NEUTRAL: 0,

    getPosts: function (subreddit = config.api.subs.default, category = config.api.sub_category_default) {
        // ToDo: subreddit not handled
        return new Promise((resolve, reject) => {
            const uri = `${config.reddit.subreddit_prefix}/${subreddit}/${category}.json`;
            // const args = {
            //     method: 'GET',
            //     headers: {
            //         'Accept': 'application/json',
            //         'Content-Type': 'application/json',
            //         'Access-Control-Allow-Origin': '*'
            //     }
            // };
            fetch(uri)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    throw new Error('Network response was not ok.');
                })
                .then((json) => {
                    for (const post of json.data.children) {
                        post.data.custom = this.buildCustomProps(post.data);
                    }
                    // console.log(json.data.children);
                    resolve(json.data.children);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },

    votePost: function (postName, token, dir) {
        return new Promise((resolve, reject) => {
            const args = {
                method: 'POST',
                headers: {
                    Authorization: 'bearer ' + token
                }
            };
            fetch(`https://oauth.reddit.com/api/vote?id=${postName}&dir=${dir}&rank=2`, args)
                .then(res => res.json())
                .then((json) => resolve(json))
                .catch(err => reject(err));
        });
    },

    getUserInfo: function (token) {
        return new Promise((resolve, reject) => {
            const args = {
                headers: {
                    Authorization: 'bearer ' + token
                }
            };
            fetch('https://oauth.reddit.com/api/v1/me', args)
                .then(res => res.json())
                .then((json) => resolve(json))
                .catch(err => reject(err));
        });
    },

    requestToken: function () {
        const unique = new Date().getUTCMilliseconds();
        const authString = `client_id=${config.api.credentials.client}&response_type=token&state=${unique}
            &redirect_uri=${config.api.credentials.app_uri}&scope=${config.api.oauth.scopes}`;
        window.location.href = 'https://www.reddit.com/api/v1/authorize?' + authString;
    },

    buildCustomProps: function (postData) {
        let canExpand = false;
        const type = this.getPostClassification(postData);
        const isMedia = this.isTypeMedia(type);
        const timePosted = this.getTimePostedPhrase(postData.created);
        let mediaPreviewUrl = null;
        let textHtml = null;
        // Determine media rreview source
        if (isMedia) {
            if (type === 'media-embed') {
                let embedUrl = postData.preview.images[0];
                const isGif = this.isGif(postData);
                if (isGif && embedUrl.variants.gif) {
                    embedUrl = embedUrl.variants.gif.source.url;
                } else {
                    embedUrl = embedUrl.source.url;
                }
                mediaPreviewUrl = this.decodeHtml(embedUrl);
            } else {
                mediaPreviewUrl = postData.url;
            }
        }
        // Only text and media posts can expand
        if (type === 'text' || isMedia) {
            canExpand = true;
        }
        // Format textHtml if any
        if (type === 'text') {
            textHtml = { __html: this.decodeHtml(postData.selftext_html) };
        }
        return {
            canExpand, type, isMedia, mediaPreviewUrl,
            textHtml, userVote: this.VOTE_NEUTRAL, timePosted
        };
    },

    isGif: function (postData) {
        return postData.url.indexOf('gif') > -1;
    },

    isTypeMedia: function (type) {
        const mediaTypes = ['media', 'media-embed'];
        return mediaTypes.indexOf(type) > -1;
    },

    getPostClassification: function (postData) {
        switch (postData.post_hint) {
            case 'link':
                if (postData.preview !== null) {
                    return 'media-embed';
                }
                return 'link';
            case 'self':
                return 'text';
            case 'image':
            case 'rich:video':
            case 'video':
                return 'media';
            default:
                return null;
        }
    },

    decodeHtml: function (html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    },

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
