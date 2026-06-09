import { useState } from "react";
import Chatbox from "../components/chatfolder/Chatbox";
import MyChats from "../components/chatfolder/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { useSelector } from "react-redux";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const [lhsfetchAgain, setlhsFetchAgain] = useState(false);
  const { user } = useSelector((state) => state.profile);
  return (
    <div className="w-full ">
      {user && <SideDrawer />}
      <div className="flex justify-between w-full h-[91.5vh] p-2">
        {user && <MyChats lhsfetchAgain={lhsfetchAgain} />}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} setlhsFetchAgain={setlhsFetchAgain} />
        )}
      </div>
    </div>
  );
};

export default Chatpage;
