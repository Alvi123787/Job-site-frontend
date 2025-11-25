import React from 'react';
import { 
    FaCheckCircle, 
    FaBuilding, 
    FaBolt, 
    FaUserTie 
} from 'react-icons/fa';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
    const benefits = [
        {
            id: 1,
            icon: <FaCheckCircle />,  // Changed from FaShieldCheck
            title: "Verified Jobs",
            description: "All listings are verified and trusted by our expert team"
        },
        {
            id: 2,
            icon: <FaBuilding />,     // Changed from FaBriefcase
            title: "Top Employers",
            description: "Connect with Fortune 500 companies and fast-growing startups"
        },
        {
            id: 3,
            icon: <FaBolt />,
            title: "Easy Apply",
            description: "One-click application process with your saved profile"
        },
        {
            id: 4,
            icon: <FaUserTie />,
            title: "Career Growth",
            description: "Access exclusive resources and career advancement tools"
        }
    ];

    return (
        <section className="benefits-section">
            <div className="benefits-container">
                <div className="benefits-header">
                    <h2 className="benefits-title home-section-title">Why Choose Us</h2>
                    <p className="benefits-subtitle home-section-subtitle">Discover what makes us the trusted platform for job seekers</p>
                </div>
                
                <div className="benefits-grid">
                    {benefits.map((benefit) => (
                        <div key={benefit.id} className="benefit-card">
                            <div className="benefit-icon-wrapper">
                                {benefit.icon}
                            </div>
                            <h3 className="benefit-title">{benefit.title}</h3>
                            <p className="benefit-description">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;