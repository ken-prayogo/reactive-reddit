import React, { Component } from 'react';
import config from '../../config.json';
import PostActions from './PostActions';
import PostDetails from './PostDetails';
import PostBody from './PostBody';
import altThumbnail from '../images/Reddit-icon.png';

class Post extends Component {

    constructor(props) {
        super(props);
        this.state = {
            thumbnail: this.props.postData.thumbnail
        };
    }

    // Swap the thumbnail's src to a placeholder image if not found
    swapThumbSrc = () => {
        this.setState({
            thumbnail: altThumbnail
        });
    }

    // Handle clicking a post's thumbnail
    handleThumbnailClick = (id, customData) => {
        if (customData.canExpand) {
            this.props.actionHandler.expandPost(id);
        } else {
            var link = document.getElementById(id + "-title-link");
            link.click();
        }
    }

    render() {
        const { index, actionHandler, expanded, postData } = this.props;
        const { title, id, permalink, custom } = postData;
        const redditLink = config.reddit.url + permalink;
        return (
            <div className="post" data-id={id}>
                <div className="post-head">
                    <img className="post-thumbnail" src={this.state.thumbnail} alt="None"
                        onClick={() => this.handleThumbnailClick(id, custom)}
                        onError={this.swapThumbSrc} />
                    <div className="post-section">
                        <a id={id + "-title-link"} href={postData.url} target="_blank">
                            <p className="post-title">{title}</p>
                        </a>
                        <PostDetails postData={postData} />
                        <PostActions customData={custom}
                            onVoteClick={(dir) => actionHandler.votePost(index, dir)}
                            onExpandClick={() => actionHandler.expandPost(id)}
                            onHidePostContent={() => actionHandler.expandPost(null)}
                            bodyExpanded={expanded}
                            link={postData.url}
                            redditLink={redditLink} />
                    </div>
                </div>
                <PostBody visible={expanded} postData={postData} />
            </div>
        );
    }

}

export default Post;
