import React from 'react'
import Mainbanner from '../components/Mainbanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import BannerSlider from '../components/BannerSlider'



const Home = () => {
  return (
   <div className='mt-10' style={{ backgroundColor: '#edfbec' }}>

      <Mainbanner />
      <BannerSlider/>
      <Categories />
      <BestSeller/>
      <BottomBanner/>
      <NewsLetter/>
      
    </div>
  )
}

export default Home
