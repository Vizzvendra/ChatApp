const UserBadgeItem = ({ user, handleFunction, admin }) => {
    return (
      <div
        className="inline-flex items-center px-2 py-1 rounded-lg m-1 mb-2 bg-blue-800 text-white text-xs cursor-pointer"
        onClick={handleFunction}
      >
        {user.firstName+" "+user.lastName}
        {admin === user._id && <span> (Admin)</span>}
        <svg
          className="ml-1 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.36a1 1 0 111.414 1.414L13.414 10.586l4.36 4.361a1 1 0 01-1.414 1.414L12 12.828l-4.361 4.36a1 1 0 11-1.414-1.414l4.36-4.361-4.36-4.361a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  };
  
  export default UserBadgeItem;
  