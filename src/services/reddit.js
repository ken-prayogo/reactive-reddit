import config from './../../config';

const reddit = {

    getPosts: function (subreddit = 'popular') {
        // ToDo: subreddit not handled
        return new Promise((resolve, reject) => {
            const uri = config.api.uri;
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
                    console.log(json.data.children);
                    resolve(json.data.children);
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    },

    buildCustomProps: function (postData) {
        let canExpand = false;
        const type = this.getPostClassification(postData);
        const isMedia = this.isTypeMedia(type);
        let mediaPreviewUrl = null;
        let textHtml = null;
        // Determine media rreview source
        if (isMedia) {
            if (type === 'media-embed') {
                let embedUrl = postData.preview.images[0];
                if (this.isGif(postData)) {
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
        return { canExpand, type, isMedia, mediaPreviewUrl, textHtml, userVote: null };
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
    }

};

export default reddit;
