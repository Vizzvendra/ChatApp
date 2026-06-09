import React from 'react'
import HighlightText from '../HomePage/HighlightText'

const Quote = () => {
  return (
    <div className=" text-xl sm:text-4xl font-semibold mx-auto py-5 text-center text-white">
        We are a vibrant
        {" "}
        <span className="bg-gradient-to-b from-[#FF512F] to-[#F09819] text-transparent bg-clip-text font-bold">
            {" "}
            community of coders
        </span>

        {", "}
        dedicated to developing  

        <span className="bg-gradient-to-b from-[#E65C00] to-[#F9D423] text-transparent bg-clip-text font-bold">
            {" "}
            innovative and impactful projects
        </span> 

        {" "}
        together. Join us today!
    </div>
  )
}

export default Quote