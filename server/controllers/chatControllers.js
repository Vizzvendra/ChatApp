const Chat = require("../models/Chat");
const User = require("../models/User");

//@route           POST /api/v1/chat/
//@access          Protected
//@description
//create a chat between two person 
//if already exist then it fetches it
const accessChat = async (req, res) => {
    const { userId } = req.body;

    // console.log("CHECK PLEASE");
    // console.log(req.user);

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    try {
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", "-password")
            .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "firstName lastName image email",
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            const chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            };

            // console.log("HOW I AM HERE");

            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//@route           GET /api/v1/chat/
//@access          Protected
//@description     
// Fetch all chats for a user
const fetchChats = async (req, res) => {
    try {
        let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "firstName lastName image email",
        });
        res.status(200).send(results);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//@description     Create New Group Chat
//@route           POST /api/v1/chat/group
//@access          Protected
const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the fields" });
    }

    const users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const currentTime = new Date();
        groupChat.users.forEach(user => {
            groupChat.userJoinTimes.set(user.toString(), currentTime);
        });

        await groupChat.save();
        

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Rename Group
// @route   PUT /api/v1/chat/rename
// @access  Protected
const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName: chatName },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(404).json({ message: "Chat Not Found" });
        }

        res.json(updatedChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// @desc    Update Show History to New Members
// @route   PUT /api/v1/chat/update-history-visibility
// @access  Protected (Only Admins can update)
const updateHistoryVisibility = async (req, res) => {
    const { chatId, showHistoryToNewMembers } = req.body;

    try {
        // Find the chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Check if the user is an admin
        if (chat.groupAdmin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only admins can update this setting" });
        }

        // Update the showHistoryToNewMembers flag
        chat.showHistoryToNewMembers = showHistoryToNewMembers;
        await chat.save();

        const Newchat=await Chat.findById(chatId).populate("users", "-password").populate("groupAdmin", "-password")
        .populate("latestMessage");

        // Return the updated chat
        res.json(Newchat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



// @desc    Remove user from Group
// @route   PUT /api/v1/chat/groupremove
// @access  Protected
const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        const removed = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } ,
            $unset: { [`userJoinTimes.${userId}`]: 1 }, 
            },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!removed) {
            return res.status(404).json({ message: "Chat Not Found" });
        }

        res.json(removed);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add user to Group
// @route   PUT /api/v1/chat/groupadd
// @access  Protected
const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        const added = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!added) {
            return res.status(404).json({ message: "Chat Not Found" });
        }

        // Initialize the join time for the new user
        const currentTime = new Date();
        added.userJoinTimes.set(userId, currentTime);

        // Save the updated chat with the new userJoinTimes map
        await added.save();
        console.log(added);
        res.json(added);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    updateHistoryVisibility,
};
