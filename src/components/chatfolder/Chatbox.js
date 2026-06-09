import React from "react";
import { useSelector } from "react-redux";
import "./styles.css";
import SingleChat from "./SingleChat";

import { ChatState } from "../../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain ,setlhsFetchAgain}) => {
//   const { selectedChat } = useSelector((state) => state.chat);
  const { selectedChat } = ChatState();

  return (
    <div
      className={`
        ${selectedChat ? "flex" : "hidden md:flex"} 
        flex-col gap-y-2 p-3 bg-richblack-300 w-full md:w-[68%] 
        rounded-lg border  
      `}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} setlhsFetchAgain={setlhsFetchAgain} />
    </div>
  );
};

export default Chatbox;

