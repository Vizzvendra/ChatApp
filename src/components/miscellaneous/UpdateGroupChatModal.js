import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import io from "socket.io-client";


import { ChatState } from "../../Context/ChatProvider";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain,setlhsFetchAgain }) => {
    const ENDPOINT = process.env.REACT_APP_URL;
    let socket;
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false); // New state to handle toggle
    const BASE_URL = process.env.REACT_APP_BASE_URL + "/api/v1";
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.profile);
  
    const { selectedChat, setSelectedChat } = ChatState();

    // Fetch showHistoryToNewMembers from selected chat when modal opens
    useEffect(() => {
        if (selectedChat) {
            setShowHistory(selectedChat.showHistoryToNewMembers);
        }
    }, [selectedChat]);
    useEffect(() => {
        socket = io(ENDPOINT);
    });

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
            const { data } = await axios.get(BASE_URL + `/auth?search=${query}`, config);
            setSearchResult(data);
            setLoading(false);
        } catch (error) {
            alert("Failed to load search results");
            setLoading(false);
        }
    };

    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
                },
            };
            const { data } = await axios.put(
                BASE_URL + `/chat/rename`,
                {
                    chatId: selectedChat._id,
                    chatName: groupChatName,
                },
                config
            );

            setSelectedChat(data);
            fetchMessages();
            socket.emit("update group", data);
            setlhsFetchAgain((prev)=>!prev);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
            setGroupChatName("");
        } catch (error) {
            alert(error.response.data.message);
            setRenameLoading(false);
        }
    };

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            alert("User is already in the group");
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
                },
            };
            const { data } = await axios.put(
                BASE_URL + `/chat/groupadd`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setlhsFetchAgain((prev)=>!prev);
            socket.emit("update group", data);
            setLoading(false);
        } catch (error) {
            alert(error.response.data.message);
            setLoading(false);
        }
    };

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            alert("Only admins can remove users");
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
                },
            };
            const { data } = await axios.put(
                BASE_URL + `/chat/groupremove`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
            if (user1._id === user._id) alert("You left the group");
            else alert("User removed successfully");
            socket.emit("update group", data);
            fetchMessages();
            setFetchAgain(!fetchAgain);
            setlhsFetchAgain((prev)=>!prev);
            setLoading(false);
        } catch (error) {
            alert(error.response.data.message);
            setLoading(false);
        }
    };

    const handleToggleHistoryVisibility = async () => {
        if (selectedChat.groupAdmin._id !== user._id) {
            alert("Only admins can toggle this setting");
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
                },
            };
            const { data } = await axios.put(
                BASE_URL + `/chat/update-history-visibility`,
                {
                    chatId: selectedChat._id,
                    showHistoryToNewMembers: !showHistory,
                },
                config
            );

            setSelectedChat(data);
            socket.emit("update group", data);
            setFetchAgain(!fetchAgain);
            setlhsFetchAgain((prev)=>!prev);
            setShowHistory(!showHistory);
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    return (
        <>
            <button
                className="p-2 bg-richblue-600 text-white rounded hover:bg-richblack-700"
                onClick={() => setIsOpen(true)}
            >
                <i className="fas fa-eye"></i>
            </button>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-richblack-700 text-white rounded-lg shadow-lg w-11/12 max-w-md">
                        <div className="border-b px-4 py-2 flex justify-between items-center">
                            <h2 className="text-lg font-bold">{selectedChat.chatName}</h2>
                            <button
                                className="text-white hover:text-richblue-800"
                                onClick={() => setIsOpen(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="flex flex-wrap mb-3">
                                {selectedChat.users.map((u) => (
                                    <UserBadgeItem
                                        key={u._id}
                                        user={u}
                                        admin={selectedChat.groupAdmin}
                                        handleFunction={() => handleRemove(u)}
                                    />
                                ))}
                            </div>

                            <div className="flex mb-3">
                                <input
                                    type="text"
                                    placeholder="Chat Name"
                                    value={groupChatName}
                                    onChange={(e) => setGroupChatName(e.target.value)}
                                    className="flex-grow text-black border rounded px-3 py-2"
                                />
                                <button
                                    onClick={handleRename}
                                    disabled={renameloading}
                                    className="ml-2 px-4 py-2 bg-richblack-500 text-white rounded hover:bg-richblack-600"
                                >
                                    {renameloading ? "Loading..." : "Update"}
                                </button>
                            </div>

                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder="Add User to group"
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full text-black border rounded px-3 py-2"
                                />
                            </div>

                            {loading ? (
                                <div className="text-center">Loading...</div>
                            ) : (
                                searchResult.map((user) => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => handleAddUser(user)}
                                    />
                                ))
                            )}
                        </div>

                        <div className="border-t px-4 py-2">
                            {/* Only Admin can toggle this */}
                            {selectedChat.groupAdmin._id === user._id && (
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-white">Show History to New Members</span>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={showHistory} 
                                            onChange={handleToggleHistoryVisibility} 
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            )}

                            <button
                                onClick={() => handleRemove(user)}
                                className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
                            >
                                Leave Group
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UpdateGroupChatModal;
