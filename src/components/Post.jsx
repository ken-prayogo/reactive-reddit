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

    render() {
        const { index, actionHandler, expanded, postData } = this.props;
        const { title, id, permalink, custom } = postData;
        const redditLink = config.reddit.url + permalink;
        return (
            <div className="post" data-id={id}>
                <div className="post-head">
                    <img className="post-thumbnail" src={this.state.thumbnail} alt="None" onError={this.swapThumbSrc} />
                    <div className="post-section">
                        <p className="post-title">{title}</p>
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
