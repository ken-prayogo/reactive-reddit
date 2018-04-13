import React, { Component } from 'react';
import config from '../../config.json';
import ThemedButton from './common/ThemedButton';

const subredditInputListName = 'subreddit-list';

class FilterMenu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            subreddit: '',
            category: '',
            subDefault: null
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ subreddit: nextProps.currentSub ? nextProps.currentSub : '' });
    }

    onSubredditChange = (e) => {
        this.setState({
            subreddit: e.target.value
        });
    }

    onCategoryChange = (e) => {
        this.setState({
            category: e.target.value
        });
    }

    onFilterSubmit = (e) => {
        e.preventDefault();
        this.props.onSubmit(
            this.state.subreddit || this.state.subDefault,
            this.state.category
        );
    }

    onInputClick = (e) => {
        e.target.select();
    }

    renderInputHelpList = () => {
        let list = [];
        const options = [];
        if (this.props.userData !== null) {
            list = this.props.userData.subs;
            for (const item of list) {
                options.push(<option key={item} value={item} />);
            }
        }
        return (
            <datalist id={subredditInputListName}>
                {options}
            </datalist>
        );
    }

    render() {
        const categories = [];
        for (const key of Object.keys(config.api.sub_categories)) {
            categories.push(
                <option key={key} value={key}>{config.api.sub_categories[key]}</option>
            );
        }
        return (
            <form className="menu-filter">
                <div className="filter-subreddit">
                    <label>Subreddit: r/</label>
                    <input value={this.state.subreddit}
                        onChange={this.onSubredditChange}
                        list={subredditInputListName}
                        onClick={this.onInputClick} />
                    {this.renderInputHelpList()}
                </div>
                <div className="filter-category">
                    <label>Category:</label>
                    <select onChange={this.onCategoryChange} value={this.state.category}>
                        {categories}
                    </select>
                </div>
                <ThemedButton onClick={this.onFilterSubmit}>Get Posts</ThemedButton>
            </form>
        );
    }
}

export default FilterMenu;
