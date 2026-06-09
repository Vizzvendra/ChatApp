import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSender } from "../../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "../miscellaneous/GroupChatModal";

import { ChatState } from "../../Context/ChatProvider";

const MyChats = ({ lhsfetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const dispatch = useDispatch();
  
  
  const { selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const { user } = useSelector((state) => state.profile);
  const BASE_URL = process.env.REACT_APP_BASE_URL + "/api/v1"
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      };

      const { data } = await axios.get(BASE_URL+"/chat", config);
      setChats(data);
    } catch (error) {
      alert("Failed to Load the chats");
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("user")));
    fetchChats();
  }, [lhsfetchAgain]);

  return (
    <div
      className={`${
        selectedChat ? "hidden" : "flex"
      } md:flex flex-col items-center p-2 mr-3 bg-richblack-600 w-full md:w-1/3 rounded-lg border`}
    >
      <div
        className="flex w-full justify-between text-white  items-center pb-3 px-3 text-lg md:text-xl font-sans"
      >
        My Chats
        <GroupChatModal>
          <button
            className="flex items-center text-sm md:text-xs lg:text-sm bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600"
          >
            New Group Chat
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </GroupChatModal>
      </div>

      <div
        className="flex flex-col p-3  w-full h-full rounded-lg overflow-hidden"
      >
        {chats ? (
          <div className="overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`cursor-pointer px-3 py-2 rounded-lg mb-2 ${
                  (selectedChat?._id && (selectedChat._id === chat?._id)) ? "bg-yellow-300 text-white" : "bg-richblue-500 text-white"
                }`}
              >
                <p>
                  {!chat.isGroupChat
                    ? ( chat.users?.length>=2 ? getSender(loggedUser, chat.users) : "Unknown Chat")
                    : chat.chatName}
                </p>
                {chat.latestMessage && (
                  <p className="text-xs mt-1">
                    <b>{chat.latestMessage.sender.firstName+" "+chat.latestMessage.sender.lastName}:</b> {" "}
                    {chat.latestMessage?.isFile ? "File" :(chat.latestMessage.content.length > 20
                      ? chat.latestMessage.content.substring(0, 20) + "..."
                      : chat.latestMessage.content)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ChatLoading />
        )}
      </div>
    </div>
  );
};

export default MyChats;
