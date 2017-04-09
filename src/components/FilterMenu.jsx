import React, { Component } from 'react';
import config from '../../config.json';

class FilterMenu extends Component {

    state = {
        subreddit: '',
        category: config.api.sub_category_default,
        subDefault: config.api.subs.default
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
                    <input placeholder={this.state.subDefault} value={this.state.subreddit} onChange={this.onSubredditChange} />
                </div>
                <div className="filter-category">
                    <label>Category:</label>
                    <select onChange={this.onCategoryChange} value={this.state.category}>
                        {categories}
                    </select>
                </div>
                <button className="btn-standard btn-filter-submit" onClick={this.onFilterSubmit}>Refresh</button>
            </form>
        );
    }
}

export default FilterMenu;
