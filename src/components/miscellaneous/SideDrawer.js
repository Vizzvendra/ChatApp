import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChatLoading from "../chatfolder/ChatLoading";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { logout } from "../../services/operations/authAPI";
import { useNavigate } from "react-router-dom";

import { ChatState } from "../../Context/ChatProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State to control drawer visibility
  const [notificationOpen, setNotificationOpen] = useState(false); // State to control notification dropdown visibility
  const [profileModalOpen, setProfileModalOpen] = useState(false); // State to control profile modal dropdown visibility

  const dispatch = useDispatch();
  const {
    setSelectedChat,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();
  const { user } = useSelector((state) => state.profile);

  const navigate = useNavigate();
  
  const notificationRef = useRef();
  const profileRef = useRef();

  const logoutHandler = () => {
    dispatch(logout(navigate));
  };

  const BASE_URL = process.env.REACT_APP_BASE_URL + "/api/v1";

  const handleSearch = async () => {
    if (!search) {
      alert("Please enter something in search");
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      };

      const { data } = await axios.get(BASE_URL + `/auth?search=${search}`, config);
      console.log("CHECK HERE ONCE");
      console.log(data);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      alert("Error occurred while loading search results");
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      };
      const { data } = await axios.post(BASE_URL + `/chat`, { userId }, config);
      console.log("Check all chat here please")
      console.log(data)

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
    } catch (error) {
      alert("Error fetching the chat: " + error.message);
    }
  };

  // Close the notification dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="flex justify-between items-center bg-richblack-700 w-full p-3 border-b-4">
        <button
          className="flex items-center font-bold p-2 text-white hover:text-blue-300"
          onClick={() => setIsDrawerOpen(true)} // Open the drawer
        >
          <i className="fas fa-search"></i>
          <span className="hidden md:flex ml-2">Search User</span>
        </button>

        <h1 className="text-2xl text-white font-semibold font-sans">Chat with LoginNest</h1>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="relative text-white"
              onClick={() => setNotificationOpen((prev) => !prev)} // Toggle notification dropdown visibility
            >
              <span
                className="text-white absolute -top-1 -right-1 bg-pink-400 
                    text-xs w-5 h-5 flex items-center 
                    justify-center rounded-full"
              >
                {notification.length}
              </span>
              <i className="fas fa-bell text-2xl"></i>
            </button>

            {notificationOpen && (
              <div
                ref={notificationRef}
                className="absolute right-0 mt-2 bg-richblue-600 text-white border rounded shadow-md w-64"
              >
                {!notification.length && <p className="p-2">No New Messages</p>}
                {notification.map((notif) => (
                  <div
                    key={notif._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center px-4"
              onClick={() => setProfileModalOpen((prev) => !prev)} // Toggle profile modal dropdown visibility
            >
              <img
                className="w-8 h-8 rounded-full mr-2"
                src={user.image}
                alt="Profile"
              />
              <span className="text-white">{user.firstName + " " + user.lastName}</span>
            </button>
            {profileModalOpen && (
              <div
                ref={profileRef}
                className="absolute right-0 mt-2 text-white bg-richblue-600 border-white border rounded shadow-md w-48"
              >
                <ProfileModal user={user}>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">My Profile</button>
                </ProfileModal>
                <hr className="my-2" />
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDrawerOpen && ( // Render the drawer conditionally
        <div className="fixed inset-0 bg-richblack-900 bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-richblue-600 text-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold border-b pb-2">Search Users</h2>
              <button
                onClick={() => setIsDrawerOpen(false)} // Close the drawer
                className="text-gray-600 hover:text-gray-800"
              >
                &times;
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-grow text-white bg-richblack-600  rounded px-4 py-2"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Go
              </button>
            </div>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <div className="text-center mt-4">Loading...</div>}
          </div>
        </div>
      )}
    </>
  );
}

export default SideDrawer;






