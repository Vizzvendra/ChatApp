import { useState } from "react";

const ProfileModal = ({ user, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <button
          className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
          onClick={onOpen}
        >
          <i className="fas fa-eye"></i>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-20">
          <div className="bg-richblack-600 text-white rounded-lg shadow-lg w-11/12 max-w-lg">
            <div className="border-b px-4 py-2 flex justify-between items-center">
              <h2 className="text-2xl font-bold font-sans">
                {user.firstName + " " + user.lastName}
              </h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={onClose}
              >
                &times;
              </button>
            </div>

            <div className="px-4 py-6 flex flex-col items-center">
              <img
                className="w-36 h-36 rounded-full mb-4"
                src={user.image}
                alt={user.firstName + " " + user.lastName}
              />
              <p className="text-lg font-medium">Email: {user.email}</p>
            </div>

            <div className="border-t px-4 py-2">
              <button
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;












