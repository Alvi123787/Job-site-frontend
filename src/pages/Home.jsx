import React from 'react'
import HomeHeader from '../components/HomeHeader'
import JobCategorySwiper from '../components/JobCategorySwiper'
import FeaturedJobs from '../components/FeaturedJobs'
import TopCompanies from '../components/TopCompanies'
import './Home.css'
import WhyChooseUs from '../components/WhyChooseUs'
import CallToAction from '../components/CallToAction'

const Home = () => {
  return (
    <div className="home-page">
      <HomeHeader />
      <JobCategorySwiper />
      <FeaturedJobs />
      <TopCompanies />
      <WhyChooseUs />
      <CallToAction />
    </div>
  )
}

export default Home