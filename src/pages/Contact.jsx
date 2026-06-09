import React from "react"

import ContactDetails from "../components/ContactPage/ContactDetails"
import ContactForm from "../components/ContactPage/ContactForm"

const Contact = () => {
  return (
    <div className="mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white lg:flex-row">
        {/* Contact Details */}
        <div className="lg:w-[40%]">
            <ContactDetails />
        </div>

        {/* Contact Form */}
        <div className="lg:w-[60%]">
            <ContactForm />
        </div>
    </div>
  )
}

export default Contact