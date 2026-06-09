import React, { useEffect, useState,useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getSender,
  getSenderFull
} from "../../config/ChatLogics";
import axios from "axios";
import io from "socket.io-client";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "../miscellaneous/UpdateGroupChatModal";
import ProfileModal from "../miscellaneous/ProfileModal";
import './styles.css'; 

import EmojiPicker from "emoji-picker-react";

import { ChatState } from "../../Context/ChatProvider";

const ENDPOINT = process.env.REACT_APP_URL;
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain ,setlhsFetchAgain}) => {
    
    
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

  const { selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  

  const dispatch = useDispatch();
//   const {  notification, selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.profile);
  


  const BASE_URL = process.env.REACT_APP_BASE_URL + "/api/v1";



  const typingTimeout = useRef(null);

  const fetchMessages = async () => {
    if (!selectedChat) {
        
        setMessages();
        return;
    }
    

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      };
      
      setLoading(true);
      
      const { data } = await axios.get(BASE_URL+`/message/${selectedChat._id}`,
        config
    );
    setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      alert("Failed to Load the Messages");
    }
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emoji) => {
    typingHandler({ target: { value: newMessage + emoji.emoji } });
    setShowEmojiPicker(false); // Close the picker after selecting an emoji
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          BASE_URL+"/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        // console.log(data);
        setMessages([...messages, data]);
        setlhsFetchAgain((prev=>!prev));
        socket.emit("new message", data);
        // setFetchAgain((prev) => !prev);
      } catch (error) {
        alert("Failed to send the Message");
      }
    }
};

const uploadFile = async (file) => {
    try {
      const fileName=file.name ;

      const res = await axios.post(BASE_URL + "/s3Url",{ fileName});
      const { key, uploadURL } = res.data;
      

      await fetch(uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file
      })

      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      };

        const { data } = await axios.post(
            BASE_URL+"/message",
            {
                content: key,
                chatId: selectedChat,
                isFile:true,
            },
            config
        );

      setMessages([...messages, data]);
      socket.emit("new message", data);
      setlhsFetchAgain((prev=>!prev));
    } catch (error) {
      alert("Failed to upload the file");
    }
  };



  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    
    socket.on("message received", (newMessageRecieved) => {
        if (
            !selectedChatCompare || // If no chat is selected
            selectedChatCompare._id !== newMessageRecieved.chat._id // Or if the new message belongs to a different chat
        ) {
            // Add to notifications if not already present
            if (!notification.some((msg) => msg._id === newMessageRecieved._id)) {
                setNotification([newMessageRecieved, ...notification]);
                setFetchAgain((prev) => !prev);
                setlhsFetchAgain((prev)=>!prev);
            }
        } else {
            // Add the new message to the current chat's messages
            setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
            setlhsFetchAgain((prev)=>!prev);
            // setFetchAgain((prev) => !prev);
        }
    });
    
    
    // Handle group updates
    socket.on("group update", (updatedGroup) => {
        setFetchAgain((prev) => !prev);
        setlhsFetchAgain((prev)=>!prev);
    });
    
    
    socket.on("group update again", (updatedGroup) => {
        
        // Check if the current user's ID is in the updatedGroup users array
        const isUserInGroup = updatedGroup.users.some((groupUser) => groupUser._id === user._id);
        
        if (isUserInGroup) {
            setSelectedChat(updatedGroup);
        } else {
            setSelectedChat(); // Or handle it however you want when the user is not in the group
        }
        
        setFetchAgain((prev) => !prev);
        setlhsFetchAgain((prev)=>!prev);
    });
    
    

  return () => {
        socket.disconnect();
    };
  }, [user,selectedChat, notification, dispatch]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat,fetchAgain, notification]);

  

const typingHandler = (e) => {
  setNewMessage(e.target.value);

  if (!socketConnected) return;

  const currentTime = new Date().getTime();
  // If the typing state is false, emit the "typing" event
  if (!typing) {
    setTyping(true);
    socket.emit("typing", selectedChat._id);
  }

  

  // If the timer is already running, clear it
  if (typingTimeout.current) {
    clearTimeout(typingTimeout.current);
  }

  // Set a new timeout to stop the typing event after a delay
  typingTimeout.current = setTimeout(() => {
    const timeNow = new Date().getTime();
    const timeDiff = timeNow - currentTime;
    // If the time difference is greater than or equal to the timer length, stop typing
    if (timeDiff >= 3000 && typing) {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }
  }, 3000);
};


  return (
    <>
      {selectedChat ? (
        <>
          <div className="flex bg-richblack-600 items-center justify-between px-10 py-3 border-b">
            <button
              className="md:hidden flex items-center text-white"
              onClick={() => setSelectedChat("")}
            >
              &#8592; Back
            </button>
            {selectedChat.isGroupChat ? (
              <>
                <span className="font-bold text-white text-lg">
                  {selectedChat.chatName.toUpperCase()}
                </span>
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  setlhsFetchAgain={setlhsFetchAgain}
                />
              </>
            ) : (
              <>
                <span className="font-bold text-white text-lg">
                  {getSender(user, selectedChat.users)}
                </span>
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            )}
          </div>
          <div className="flex flex-col justify-end p-3 bg-richblack-600 h-full rounded-lg overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="loader" />
              </div>
            ) : (
              <ScrollableChat messages={messages} />
            )}
            {istyping && (
            <div className="pl-10 pb-4 pt-2 typing-animation">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
            </div>
            )}

            {/* swap the lower commented div with this if error occur in emoji */}
            <div className="relative">
                <div className="flex items-center gap-2 mt-2">
                <input
                    type="text"
                    placeholder="Enter a message.."
                    className="p-2 border rounded-md text-white bg-richblue-600 w-full"
                    value={newMessage}
                    onChange={typingHandler}
                    onKeyDown={sendMessage}
                />
                <button
                    className="text-white bg-richblue-700 p-2 rounded-md"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                    😀
                </button>
                <label htmlFor="file-input" className="text-white bg-richblue-700 p-2 rounded-md cursor-pointer">
                  📎
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    onChange={(e) =>{
                        if (e.target.files[0]) {
                            uploadFile(e.target.files[0]); // Call the upload function
                            e.target.value = null; // Reset the input value to allow selecting the same file again
                        }
                    }}
                  />
                </label>
                </div>
                {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-50">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
                )}
            </div>

            {/* <input
              type="text"
              placeholder="Enter a message.."
              className="mt-2 p-2 border rounded-md text-white bg-richblue-600 w-full"
              value={newMessage}
              onChange={typingHandler}
              onKeyDown={sendMessage}
            /> */}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-xl">Click on a user to start chatting</span>
        </div>
      )}
    </>
  );
};

export default SingleChat;

