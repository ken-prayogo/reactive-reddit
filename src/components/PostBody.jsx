import React, { Component } from 'react';

class PostBody extends Component {

    renderContent() {
        const { isMedia, mediaEmbed, mediaPreviewUrl, type, textHtml } = this.props.postData.custom;
        if (isMedia) {
            if (mediaEmbed) {
                return (
                    <div className="post-media-embed"
                        dangerouslySetInnerHTML={mediaEmbed} />
                );
            }
            return (
                <img className="post-preview-media"
                    src={mediaPreviewUrl}
                    alt="Not found" />
            );
        } else if (type === 'text') {
            return <div className="post-body-html" dangerouslySetInnerHTML={textHtml} />;
        } else {
            return null;
        }
    }

    render() {
        if (!this.props.visible) {
            return null;
        }
        return (
            <div className="post-body">
                {this.renderContent()}
            </div>
        );
    }

}

export default PostBody;
