import React from "react";
import { useNavigate } from 'react-router-dom';
import SearchBar from "./SearchBar";
import { CATEGORIES } from "../data/categories";
import "./HomeHeader.css";

const Header = () => {
    const navigate = useNavigate();
    return (
        <div className="home-header">
            <div className="home-header__overlay">
                <div className="home-header__container">
                    <div className="home-header__content">
                        <h1 className="home-header__title">
                            Find Your <span className="home-header__highlight">Dream Job</span>
                        </h1>
                        <p className="home-header__description">
                            Connect with top companies and discover opportunities that match your skills and aspirations
                        </p>
                        <div className="home-header__actions">
                            <button
                                type="button"
                                className="home-header__cta home-header__cta--primary"
                                onClick={() => navigate('/jobs')}
                            >
                                Explore Jobs
                            </button>
                        </div>
                        {(() => {
                            const popular = ['Remote', ...CATEGORIES.slice(0,4).map(c => c.name)];
                            return <SearchBar popularTags={popular} />;
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;