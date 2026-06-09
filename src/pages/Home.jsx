import React from 'react'
import HighlightText from '../components/core/HomePage/HighlightText'
import CodeBlocks from "../components/core/HomePage/CodeBlocks"

const Home = () => {
return (
    <div className='relative mx-auto my-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between'>
            <div>
                <CodeBlocks 
                    position={"lg:flex-row"}
                    heading={
                        <div className='text-4xl font-semibold'>
                            Unlock Your
                            <HighlightText text={"coding potential"}/>
                            {" "}
                            with our website
                        </div>
                    }
                    subheading = {
                        "Welcome to our community of passionate coders! Explore a space where creativity meets innovation, and collaborate on exciting projects that push the boundaries of technology"
                    }
                    ctabtn1={
                        {
                            btnText: "sign up",
                            linkto: "/signup",
                            active: true,
                        }
                    }
                    ctabtn2={
                        {
                            btnText: "login",
                            linkto: "/login",
                            active: false,
                        }
                    }

                    codeblock={`<<!DOCTYPE html>\n<html>\nhead><title>Example</title><linkrel="stylesheet"href="styles.css">\n/head>\n`}
                    backgroundGradient={<div className="codeblock1 absolute"></div>}
                    codeColor={"text-yellow-25"}
                />
            </div>
    </div>
  )
}

export default Home
