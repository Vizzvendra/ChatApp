

const UserListItem = ({ user,handleFunction }) => {

  return (
    <div
      onClick={handleFunction}
      className="cursor-pointer bg-gray-200 hover:bg-teal-500 hover:text-yellow-300 w-full text-white flex items-center px-3 py-2 mb-2 rounded-lg"
    >
      <img
        className="mr-2 h-8 w-8 rounded-full cursor-pointer"
        src={user.image}
        alt={user.firstName+" "+user.lastName}
      />
      <div>
        <p className="text-sm font-medium">{user.firstName+" "+user.lastName}</p>
        <p className="text-xs">
          <b>Email:</b> {user.email}
        </p>
      </div>
    </div>
  );
};

export default UserListItem;
