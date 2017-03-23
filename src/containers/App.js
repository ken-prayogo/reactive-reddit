import React, { Component } from 'react';
import Header from './../components/Header';
import Post from './../components/Post';
import reddit from './../services/reddit';

class App extends Component {
    /**
     * Get posts on load
     */
    componentWillMount() {
        reddit.getPosts().then((posts) => {
            this.setState({ posts });
        });
    }

    state = {
        menuOpen: false,
        expandedPostId: null,
        posts: []
    };

    openMenu(e) {
        console.log('Open menu...');
    }

    openUserMenu(e) {
        console.log('Open user menu...');
    }

    actionHandler = {
        votePost: (index, vote) => {
            // Add vote data to the post state
            const newPosts = [
                ...this.state.posts
            ];
            let currentUserVote = newPosts[index].data.custom.userVote;
            // Revert score first (if previously clicked)
            newPosts[index].data.score -= reddit.getVoteCount(currentUserVote);

            // Now determine the vote after-click
            // Logic Note: If the same vote is clicked twice, cancel the vote
            currentUserVote = currentUserVote === vote ? null : vote;
            newPosts[index].data.custom.userVote = currentUserVote;

            // Update score
            newPosts[index].data.score += reddit.getVoteCount(currentUserVote);

            this.setState({
                posts: newPosts
            });
        },
        expandPost: (postId) => {
            this.setState({
                expandedPostId: postId
            });
        }
    }

    renderPosts() {
        return this.state.posts.map((child, index) => {
            const post = child.data;
            return (
                <Post key={post.id} index={index} postData={post}
                    actionHandler={this.actionHandler}
                    expanded={this.state.expandedPostId === post.id} />
            );
        });
    }

    render() {
        return (
            <div className="App">
                <Header title="Reactive Reddit" onMenuClick={this.openMenu} onUserClick={this.openUserMenu} />
                <div className="Body">
                    {this.renderPosts()}
                </div>
            </div>
        );
    }
}

export default App;
