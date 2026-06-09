import loginImg from "../assets/Images/login.webp"
import Template from "../components/core/Auth/Template"

function Login() {
  return (
    <Template
      title="Welcome Back"
      description1="Log in to access your account and "
      description2="continue where you left off."
      image={loginImg}
      formType="login"
    />
  )
}

export default Login