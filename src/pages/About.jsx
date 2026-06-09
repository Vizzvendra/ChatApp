import React from 'react'
import HighlightText from "../components/core/HomePage/HighlightText"
import BannerImage1 from "../assets/Images/aboutus1.webp"
import BannerImage2 from "../assets/Images/aboutus2.webp"
import BannerImage3 from "../assets/Images/aboutus3.webp"

import Quote from "../components/core/AboutPage/Quote"

const About = () => {
  return (
    <div>
        <section className="bg-richblack-700">
            <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-center text-white">
                <header className="mx-auto pb-20 pt-12 md:text-4xl sm:text-3xl text-2xl font-semibold lg:w-[70%]">
                    Join a Thriving Community of 
                    <HighlightText text={"Coders "} />
                    and
                    <HighlightText text={"Creators"} />
                </header>

                <div className="h-[20px]  md:h-[140px]"></div>
                    
                <div className="absolute max-h bottom-0 left-[50%] grid md:w-[100%] w-[90%]  translate-x-[-50%] md:translate-y-[30%] translate-y-[50%] grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-5">
                    <img className='rounded-md' src={BannerImage1} alt="" />
                    <img className='rounded-md hidden sm:block' src={BannerImage2} alt="" />
                    <img className='rounded-md ' src={BannerImage3} alt="" />
                </div>
            </div>
        </section>

        <section className=" border-richblack-700">
            <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-richblack-500">
                <div className="sm:h-[100px] h-[80px] "></div>
                <Quote />
            </div>
        </section>  
    </div>
        
  )
}

export default About
