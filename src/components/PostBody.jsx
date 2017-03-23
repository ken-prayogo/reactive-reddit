import React, { Component } from 'react';

class PostBody extends Component {

    state = {
        ...this.props.postData.custom
    };

    renderContent() {
        if (this.state.isMedia) {
            return <img className="post-preview-media" src={this.state.mediaPreviewUrl} alt="Not found" />;
        } else if (this.state.type === 'text') {
            return <div className="post-body-html" dangerouslySetInnerHTML={this.state.textHtml} />;
        } else {
            return null;
        }
    }

    render() {
        return (
            <div className={`post-body ${!this.props.visible ? 'hidden' : ''}`}>
                {this.renderContent()}
            </div>
        );
    }
}

export default PostBody;
