import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import io from "socket.io-client";

import { ChatState } from "../../Context/ChatProvider";

const GroupChatModal = ({ children }) => {
    
  const { chats, setChats } = ChatState();
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL + "/api/v1"

//   const { chats } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.profile);
//   const dispatch = useDispatch();

const ENDPOINT = process.env.REACT_APP_URL;
let socket;

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      alert("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: {
         Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      };
      const { data } = await axios.get(BASE_URL+`/auth?search=${search}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      alert("Failed to load the search results");
      setLoading(false);
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
   
    if (!groupChatName || !selectedUsers) {
      alert("Please fill all the fields");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      };
      const { data } = await axios.post(
        BASE_URL+`/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      console.log(data);
      socket.emit("update group", data);
      console.log(chats);
      onClose();
      alert("New Group Chat Created!");
    } catch (error) {
      alert("Failed to create the chat!");
    }
  };

  useEffect(()=>{
    socket = io(ENDPOINT);
  })

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-20">
          <div className="bg-richblack-600 rounded-lg shadow-lg w-11/12 max-w-lg">
            <div className="border-b px-4 py-2 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create Group Chat</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={onClose}
              >
                &times;
              </button>
            </div>

            <div className="px-4 py-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Chat Name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  className="w-full bg-richblue-500 border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Add Users eg: John, Piyush, Jane"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full  bg-richblue-500 border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-wrap mb-4">
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                  />
                ))}
              </div>

              {loading ? (
                <div className="text-center">Loading...</div>
              ) : (
                searchResult?.slice(0, 4).map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
              )}
            </div>

            <div className="border-t px-4 py-2">
              <button
                onClick={handleSubmit}
                className="w-full bg-richblue-600 text-white py-2 rounded hover:bg-richblue-500"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;



