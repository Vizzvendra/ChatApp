import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setUser } from "../slices/profileSlice"; // Adjust path to your slice
import { setToken } from "../slices/authSlice"; // Adjust path to your slice
import { useNavigate } from "react-router-dom";

const GoogleAuthRedirect = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const setupUser = () => {
      try {
        // Read token and user from cookies
        // const token = Cookies.get("token");
        // const user = Cookies.get("user");

        const urlParams = new URLSearchParams(window.location.search);
        const rawUser = urlParams.get("token");
        // console.log("URL", window.location.href);
        // console.log("rawUser", rawUser);
        if (!rawUser) {
            console.log("user absent");
            navigate("/login");
            return;
        }
        const parsedUser = JSON.parse(decodeURIComponent(rawUser));
        console.log(parsedUser);
        
        
        // // Update Redux slice
        dispatch(setToken(parsedUser.token))
        const userImage = parsedUser?.image
        ? parsedUser.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${parsedUser.firstName} ${parsedUser.lastName}`
        dispatch(setUser({ ...parsedUser, image: userImage }))

        // // Redirect to actual profile page
        navigate("/dashboard/my-profile");
      } catch (error) {
        console.error("Error setting up user:", error);
        navigate("/login");
      }
    };

    setupUser();
  }, [dispatch, navigate]);

  return (
    <div>
        <h1>Loading...</h1>
        {/* Optionally, add a spinner or loading indicator */}
    </div>
  );
};

export default GoogleAuthRedirect;
