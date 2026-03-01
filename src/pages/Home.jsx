import React from 'react'
import Mainbanner from '../components/Mainbanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import BannerSlider from '../components/BannerSlider'

const Home = () => {
  return (
    /* 1. Removed hardcoded #edfbec 
       2. Added bg-main-bg for automatic theme switching
       3. Added transition-colors for a smooth fade when toggling
    */
    <div className='mt-10 bg-main-bg transition-colors duration-300 min-h-screen'>
      <Mainbanner />
      <BannerSlider />
      <Categories />
      <BestSeller />
      <BottomBanner />
      <NewsLetter />
    </div>
  )
}

export default Home