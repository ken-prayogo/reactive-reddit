import config from './../../config';
/**
 * Date/Time management
 */
import moment from 'moment';
moment().format();

const reddit = {
    VOTE_UP: 'up',
    VOTE_DOWN: 'down',

    getPosts: function (subreddit = config.api.subs.default, category = config.api.sub_category_default) {
        // ToDo: subreddit not handled
        return new Promise((resolve, reject) => {
            const uri = `${config.api.subreddit_prefix}/${subreddit}/${category}.json`;
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
        return { canExpand, type, isMedia, mediaPreviewUrl,
            textHtml, userVote: null, timePosted };
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

    getVoteCount: function (vote) {
        switch (vote) {
            case this.VOTE_UP:
                return 1;
            case this.VOTE_DOWN:
                return -1;
            default:
                return 0;
        }
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
