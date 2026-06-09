import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function ChangeLog() {
  const { id: documentId } = useParams();
  const [changeLog, setChangeLog] = useState([]);
  let navigate=useNavigate();

  useEffect(() => {
    const fetchChangeLog = async () => {
      try {
        const response = await axios.get(
            process.env.REACT_APP_URL+`/api/v1/documents/${documentId}`
        );
        setChangeLog(response.data);
      } catch (error) {
        console.error("Error fetching change log:", error);
      }
    };

    fetchChangeLog();
  }, [documentId]);

  let lastUser = null;

  return (
    <div className="bg-richblack-800 text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold  p-3">
          CHANGE TRACKING
        </h3>
        <button
          onClick={() => navigate(`/documents/${documentId}`)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Edit Document
        </button>
      </div>
      <ul>
        {changeLog.map((log, index) => {
          const isSameUser = log.user?.firstName === lastUser;
          if (!isSameUser) lastUser = log.user?.firstName;

          return (
            <li
              key={index}
              className={"mb-1"} /* Minimal margin for same user */
            >
              {/* Render user name only if it changes */}
              {!isSameUser && (
                <p className="text-center text-lg font-semibold mb-2">
                  {log.user?.firstName+" "+ log.user?.lastName || "Unknown User"}
                </p>
              )}

              {/* Show date, time, and changes on the same line */}
              <p
                className="p-3 rounded-lg break-words"
                style={{
                  backgroundColor: "#1E293B", // Tailwind's slate-800 equivalent
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                <span className="italic mr-4">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                {log.changes}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
