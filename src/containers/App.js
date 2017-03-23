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
        expandPost: (postId) => {
            this.setState({
                expandedPostId: postId
            });
        }
    }

    renderPosts() {
        return this.state.posts.map(child => {
            const post = child.data;
            return (
                <Post key={post.id} postData={post}
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
