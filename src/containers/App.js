import React, { Component } from 'react';
import Header from '../components/Header';
import Post from '../components/Post';
import FilterMenu from '../components/FilterMenu';
import Spinner from '../components/Spinner';
import UserMenu from '../components/UserMenu';
import AlertDialog from '../components/common/AlertDialog';
import reddit from '../services/reddit';
import utils from '../js/utils';
import config from '../../config.json';

class App extends Component {
    /**
     * Get posts on load
     */
    componentWillMount() {
        const url = window.location.href;
        if (url.includes('error')) {
            console.log(`Validation failed. ${utils.getParameterByName('error', url)}`);
        } else {
            reddit.getPosts()
                .then((posts) => {
                    this.setState({ posts, loading: false });
                })
                .catch(err => console.log(err));
        }
    }

    componentDidMount() {
        const url = window.location.href;
        if (url.includes('access_token')) {
            const accessToken = utils.getParameterByName('access_token');
            const tokenExpiration = utils.getParameterByName('expires_in');
            this.setState({ accessToken, tokenExpiration }, () => {
                reddit.getUserInfo(this.state.accessToken)
                    .then((userData) => {
                        this.setState({ user: userData });
                    })
                    .catch(err => console.log(err));
            });
        }
    }

    state = {
        menuOpen: false,
        expandedPostId: null,
        loading: true,
        accessToken: null,
        tokenExpiration: 0,
        user: null,
        posts: [],
        userMenuVisible: false,
        alert: {
            show: false,
            title: '',
            message: ''
        }
    };

    getPosts = (subreddit, category) => {
        this.setState({ loading: true });
        reddit.getPosts(subreddit, category)
            .then((posts) => {
                this.setState({ posts });
            })
            .catch((err) => {
                this.showAlert(
                    `Post Fetch Failed (${err.name})`,
                    err.message + '. Your search might be invalid.'
                );
            })
            .then(() => { this.setState({ loading: false }); });
    }

    openMenu(e) {
        console.log('Open menu...');
    }

    /**
     * Takes a boolean to display or hide the user menu
     * @param {!boolean} doDisplay - true to display
     */
    displayUserMenu = (doDisplay) => {
        this.setState({ userMenuVisible: doDisplay });
    }

    signIn() {
        reddit.requestToken();
    }

    signOut() {
        window.location.href = config.app.url;
    }

    // TODO: Show Alert Dialog with options
    showAlert = (title, message) => {
        const alert = { ...this.state.alert };
        alert.title = title;
        alert.message = message;
        alert.show = true;
        this.setState({ alert });
    }

    dismissAlert = () => {
        const alert = { ...this.state.alert };
        alert.show = false;
        this.setState({ alert });
    }

    actionHandler = {

        votePost: (index, dir) => {
            if (this.state.user === null) {
                this.showAlert('Action Not Allowed', 'You must be logged in to vote!');
                return;
            }
            // Add vote data to the post state
            const newPosts = [
                ...this.state.posts
            ];
            let currentUserVote = newPosts[index].data.custom.userVote;
            // Revert score first (if previously clicked)
            newPosts[index].data.score -= currentUserVote;

            // Now determine the vote after-click
            // Logic Note: If the same vote is clicked twice, cancel the vote
            currentUserVote = currentUserVote === dir ? reddit.VOTE_NEUTRAL : dir;
            newPosts[index].data.custom.userVote = currentUserVote;

            // Update score
            newPosts[index].data.score += currentUserVote;

            // POST request
            reddit.votePost(
                this.state.posts[index].data.name,
                this.state.accessToken,
                currentUserVote
            ).then(() => {
                this.setState({ posts: newPosts });
            }).catch(err => console.log(err));
        },

        expandPost: (postId) => {
            this.setState({
                expandedPostId: postId
            });
        }

    }

    renderLoading() {
        if (this.state.loading) {
            return <Spinner />;
        }
        return null;
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
                <Header title="Reactive Reddit" onMenuClick={this.openMenu} onUserHover={() => this.displayUserMenu(true)} />
                <UserMenu visible={this.state.userMenuVisible}
                    user={this.state.user}
                    isLoggedIn={this.state.user !== null}
                    onHoverLeave={() => this.displayUserMenu(false)}
                    onSignIn={this.signIn}
                    onSignOut={this.signOut} />
                <FilterMenu onSubmit={this.getPosts} />
                {this.renderLoading()}
                <div className="Body">
                    {this.renderPosts()}
                </div>
                <AlertDialog show={this.state.alert.show}
                    title={this.state.alert.title}
                    message={this.state.alert.message}
                    onDismiss={this.dismissAlert} />
            </div>
        );
    }
}

export default App;
