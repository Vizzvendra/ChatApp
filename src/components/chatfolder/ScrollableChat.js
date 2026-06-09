import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../../config/ChatLogics";
import { useSelector } from "react-redux";
import axios from "axios";
import { saveAs } from "file-saver";

const BASE_URL = process.env.REACT_APP_BASE_URL + "/api/v1";

const ScrollableChat = ({ messages}) => {
  const { user } = useSelector((state) => state.profile);
 
  const generateDownloadLink = async (fileUrl) => {
    try {
        const res = await axios.get(BASE_URL +"/s3Url/download", {params: {fileUrl}});
        const url=res.data.url;
        if (!url) {
            throw new Error("Download URL not found in response.");
          }

          const response = await axios.get(url, { responseType: "blob" }); // Fetch the file as a blob
          const fileName = url.match(/\/([^\/?]+)(?=\?)/)[1];
          const decodedFileName = decodeURIComponent(fileName);
          const trimmedFileName = decodedFileName.slice(32); 
          saveAs(response.data, trimmedFileName);
          
      
    } catch (error) {
      alert("Error while generating download link.");
    }
  };

  return (
    <ScrollableFeed>
      {messages && 
        messages.map((m, i) => (
            
          <div className="flex" key={m._id}>
          
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <img
                    className="h-8 w-8 rounded-full mr-2 mt-1"
                    src={
                        m.sender.image
                        ? m.sender.image
                        : `https://api.dicebear.com/5.x/initials/svg?seed=${m.sender.firstName}`
                    }
                    alt={m.sender.firstName + " " + m.sender.lastName}
                    />
            )}
            <span
              className={`rounded-2xl px-4 py-2 max-w-[75%] break-words overflow-hidden whitespace-normal text-sm ${
                m.sender._id === user._id
                  ? "bg-blue-200 text-right ml-auto"
                  : "bg-pink-50 text-left"
              }`}
              style={{
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
              }}
            >
              {m.isFile ? (
                <button
                  onClick={() => generateDownloadLink(m.content)}
                  className="text-blue-600 underline flex items-center"
                >
                    
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.75 6.75v10.5c0 .69.56 1.25 1.25 1.25h12c.69 0 1.25-.56 1.25-1.25V6.75"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.75 3.75h8.5M7.75 3.75L5.5 6m2.25-2.25L9.75 6"
                    />
                  </svg>
                  Download File
                </button>
              ) : (
                m.content
              )}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;


