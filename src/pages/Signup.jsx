import signupImg from "../assets/Images/signup.webp"
import Template from "../components/core/Auth/Template"

function Signup() {
  return (
    <Template
      title="Be Part of a Growing Community"
      description1="Create your account to unlock special perks and stay in the loop."
      description2="It only takes a moment to get started"
      image={signupImg}
      formType="signup"
    />
  )
}

export default Signup