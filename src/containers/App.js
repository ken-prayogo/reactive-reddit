import React, { Component } from 'react';
import Waypoint from 'react-waypoint';
import Header from '../components/Header';
import Post from '../components/Post';
import FilterMenu from '../components/FilterMenu';
import Spinner from '../components/Spinner';
import UserMenu from '../components/UserMenu';
import AlertDialog from '../components/common/AlertDialog';
import SubDescription from '../components/SubDescription';
import reddit from '../services/reddit';
import utils from '../js/utils';
import config from '../../config.json';

class App extends Component {

    // Initialize state
    constructor(props) {
        super(props);
        this.state = {
            menuOpen: false,
            expandedPostId: null,
            loading: true,
            accessToken: null,
            tokenExpiration: 0,
            user: null,
            posts: [],
            lastPost: null,
            userMenuVisible: false,
            alert: {
                show: false,
                title: '',
                message: ''
            },
            currentSub: null,
            currentSubCategory: null
        };
    }

    // Initiation logic to determine errors, user logins, etc
    componentWillMount() {
        const url = window.location.href;
        if (url.includes('access_token')) {
            // Access token received
            const accessToken = utils.getParameterByName('access_token');
            const tokenExpiration = utils.getParameterByName('expires_in');
            // Set the access token then get user info and user Front Page
            this.setState({ accessToken, tokenExpiration });
        } else {
            if (url.includes('error')) {
                this.showAlert(
                    'Validation Failed',
                    `Your login could not be completed. Error: ${utils.getParameterByName('error', url)}`
                );
            }
            // Not logged in
            reddit.getSubredditPosts()
                .then(({ children, after }) => {
                    this.setState({
                        posts: children,
                        lastPost: after,
                        loading: false,
                        currentSub: config.api.subs.default
                    });
                })
                .catch(err => {
                    this.showAlert('Post Retrieval Failed', `Whoops! Something went wrong... Error: ${err}`);
                });
        }
    }

    // After initial logic, load up any user data
    componentDidMount() {
        if (this.state.accessToken) {
            this.getUserData();
        }
    }

    /**
     * Gets a list of posts from a subreddit
     * @param {string} subreddit - The sub
     * @param {string} category - Hot, Rising, New, etc
     */
    getPosts = (subreddit, category) => {
        this.setState({ loading: true });
        reddit.getSubredditPosts(subreddit, category, this.state.accessToken)
            .then(({ children, after }) => {
                this.setState({
                    posts: children,
                    lastPost: after
                });
            })
            .catch((err) => {
                this.handlePostError(err);
            })
            .then(() => {
                this.setState({
                    loading: false,
                    currentSub: subreddit,
                    currentSubCategory: category
                });
            });
    }

    getMorePosts = () => {
        const { currentSub, currentSubCategory, accessToken, lastPost, posts } = this.state;
        if (posts.length === 0) return;
        const args = {
            after: lastPost
        };

        this.setState({ loading: true });
        reddit.getSubredditPosts(currentSub, currentSubCategory, accessToken, args)
            .then(({ children, after }) => {
                this.setState({
                    posts: [...posts, ...children],
                    lastPost: after
                });
            })
            .catch((err) => {
                this.handlePostError(err);
            })
            .then(() => {
                this.setState({
                    loading: false
                });
            });
    }

    handlePostError = (err) => {
        const title = err.name ? `(${err.name})` : '';
        const msg = err.message ? err.message + '. ' : '';
        this.showAlert(
            `Post Fetch Failed ${title}`,
            msg + 'Your search might be invalid.'
        );
    }

    // Gets the user's data, preferences, and Frontpage posts list
    getUserData = () => {
        reddit.getUserInfo(this.state.accessToken)
            .then((user) => {
                this.setState({ user });
                // TODO: Page 2 for frontpage broken
                return reddit.getUserFrontPage(this.state.accessToken);
            })
            .then(({ children, after }) => {
                this.setState({
                    posts: children,
                    lastPost: after,
                    loading: false,
                    currentSub: config.api.subs.default_logged_in,
                    currentSubCategory: config.api.sub_category_default
                });
            })
            .catch(err => this.showAlert('Post Retrieval Failed', `Whoops! Something went wrong... Error: ${err}`));
    }

    /**
     * Takes a boolean to display or hide the user menu
     * @param {!boolean} doDisplay - true to display
     */
    displayUserMenu = (doDisplay) => {
        this.setState({ userMenuVisible: doDisplay });
    }

    // Redirect to Reddit to request an access token
    signIn() {
        reddit.requestToken();
    }

    // Resets any state related to the user
    signOut = () => {
        this.setState({
            user: null,
            accessToken: null
        }, () => {
            this.getPosts(this.state.currentSub, this.state.currentSubCategory);
        });
    }

    /**
     * Alert pop-up trigger
     * @param {!string} title
     * @param {!string} message
     */
    showAlert = (title, message) => {
        const alert = { ...this.state.alert };
        alert.title = title;
        alert.message = message;
        alert.show = true;
        this.setState({ alert });
    }

    // Closes an alert dialog
    dismissAlert = () => {
        const alert = { ...this.state.alert };
        alert.show = false;
        this.setState({ alert });
    }

    // A set of "actions" performed on a post
    actionHandler = {

        /**
         * Vote on a post. Will immediately show feedback, can undo previous
         * votes, and will revert feedback if the vote API request fails
         * @param {!int} index - The index of the Post to vote on
         * @param {!int} dir - The direction of the vote (1,0,-1)
         */
        votePost: (index, dir) => {
            if (this.state.user === null) {
                this.showAlert('Action Not Allowed', 'You must be logged in to vote!');
                return;
            }
            // Add vote data to the post state
            const newPosts = [
                ...this.state.posts
            ];
            let oldUserVote = newPosts[index].data.custom.userVote;
            // Revert score first (if previously clicked)
            newPosts[index].data.score -= oldUserVote;

            // Now determine the vote after-click
            // Logic Note: If the same vote is clicked twice, cancel the vote
            let currentUserVote = oldUserVote === dir ? reddit.VOTE_NEUTRAL : dir;
            newPosts[index].data.custom.userVote = currentUserVote;

            // Update score. Let State update first for UI feedback to kick in
            newPosts[index].data.score += currentUserVote;
            this.setState({ posts: newPosts });

            // POST request
            reddit.votePost(
                this.state.posts[index].data.name,
                this.state.accessToken,
                currentUserVote
            ).catch(err => {
                this.showAlert('Vote Failed', `Whoops! Your vote did not get through. Error: ${err}`);
                // If vote failed, revert vote
                newPosts[index].data.score -= currentUserVote;
                newPosts[index].data.custom.userVote -= currentUserVote;
                this.setState({ posts: newPosts });
            });
        },

        /**
         * Expands specified post
         * @param {!string} postId
         */
        expandPost: (postId) => {
            this.setState({
                expandedPostId: postId
            });
        }

    }

    // Conditional rendering for posts
    renderPosts = () => {
        if (this.state.posts.length === 0) {
            return null;
        }
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
                <Header title="Reactive Reddit" onUserHover={() => this.displayUserMenu(true)} />
                <UserMenu visible={this.state.userMenuVisible}
                    user={this.state.user}
                    isLoggedIn={this.state.user !== null}
                    onHoverLeave={() => this.displayUserMenu(false)}
                    onSignIn={this.signIn}
                    onSignOut={this.signOut} />
                <div className="content-wrap">
                    <FilterMenu onSubmit={this.getPosts}
                        userData={this.state.user}
                        currentSub={this.state.currentSub}
                        currentSubCategory={this.state.currentSubCategory} />
                    <SubDescription currentSub={this.state.currentSub} user={this.state.user} />
                    <div className="Body">
                        {this.renderPosts()}
                    </div>
                </div>
                <Spinner visible={this.state.loading} />
                <Waypoint onEnter={this.getMorePosts} />
                <AlertDialog show={this.state.alert.show}
                    title={this.state.alert.title}
                    message={this.state.alert.message}
                    onDismiss={this.dismissAlert} />
            </div>
        );
    }
}

export default App;
