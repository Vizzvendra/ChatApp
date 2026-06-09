import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import "./TextEditor.css";
import { useSelector } from "react-redux";
import { v4 as uuidv4, validate as validateUuid } from "uuid";

const SAVE_INTERVAL_MS = 2000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function TextEditor() {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [joinDocId, setJoinDocId] = useState("");
  const { user } = useSelector((state) => state.profile);
  const userId = user._id;

  useEffect(() => {
    const s = io(process.env.REACT_APP_URL);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;
    

    socket.emit("get-document", documentId);

    const handleLoadDocument = (document) => {
    quill.setContents(document);
    quill.enable();
    };

    socket.on("load-document", handleLoadDocument);

    return () => {
    // Cleanup for when switching documents
    socket.off("load-document", handleLoadDocument);
    quill.setContents(""); // Clear quill's content
    quill.disable(); // Disable editing until new content is loaded
    };

  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", { data: quill.getContents(), userId });
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill,documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", { delta, userId });
    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill,documentId]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);

    
  }, []);

  const handleGenerateDocument = () => {
    const newDocId = uuidv4();
    navigate(`/documents/${newDocId}`);
  };

  const handleJoinDocument = () => {
    if (!joinDocId.trim()) return;
  
    // Validate if the ID is a valid UUIDv4
    if (!validateUuid(joinDocId)) {
      alert("Invalid Document ID. Please enter a valid ID.");
      return;
    }
  
    // Proceed with navigation and reset joinDocId
    navigate(`/documents/${joinDocId}`);
    setJoinDocId("");
  };

  const handleCopy = (type) => {
    const text =
      type === "id"
        ? documentId
        : `${window.location.origin}/documents/${documentId}`;
    navigator.clipboard.writeText(text);
    alert(`${type === "id" ? "ID" : "Link"} copied to clipboard!`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Sidebar Controls */}
      <div className="sidebarControls w-full lg:w-48 bg-richblack-900 text-white p-4 flex flex-col items-start gap-8">
        <button
          onClick={handleGenerateDocument}
          className="w-full text-sm bg-richblue-400 px-2 py-1 rounded hover:bg-blue-600"
        >
          New Document
        </button>
        <div className="w-full">
          <input
            type="text"
            value={joinDocId}
            onChange={(e) => setJoinDocId(e.target.value)}
            placeholder="Document ID"
            className="w-full px-2 py-1 bg-pink-400 text-center text-black rounded mb-2"
          />
          <button
            onClick={handleJoinDocument}
            className="w-full text-sm  bg-pink-600 px-2 py-1 rounded hover:bg-pink-700"
          >
            Join Document By ID
          </button>
        </div>
        <button
          onClick={() => handleCopy("id")}
          className="w-full text-sm bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600"
        >
          Copy Doc ID
        </button>
        <button
          onClick={() => handleCopy("link")}
          className="w-full text-sm bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600"
        >
          Copy Document Link
        </button>
        <button
            onClick={() => navigate(`/documents/changelog/${documentId}`)}
            className="w-full text-sm bg-richblue-300 px-2 py-1 rounded hover:bg-richblue-200"
        >
            View Change Log
        </button>
      </div>

      {/* Quill Editor */}
      <div className="flex-1 p-4 overflow-auto">
        <div
          className="container break-words w-full h-full"
          ref={wrapperRef}
        ></div>
      </div>
    </div>
  );
}
