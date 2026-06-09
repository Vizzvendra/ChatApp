const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");

//@description     Get all Messages
//@route           GET /api/v1/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
    try {
        // Fetch the chat details
        const chat = await Chat.findById(req.params.chatId)
            .populate("users", "_id firstName lastName email")
            .populate("groupAdmin", "_id firstName lastName email")
            .lean(); // Convert the Mongoose document to a plain JavaScript object

        if (!chat) {
            res.status(404);
            throw new Error("Chat not found");
        }

        let query = { chat: req.params.chatId };

        // Check if it's a group chat and showHistoryToNewMembers is false
        if (chat.isGroupChat && !chat.showHistoryToNewMembers) {
            // Find the user's join time from the userJoinTimes object
            const userJoinTime = chat.userJoinTimes[req.user._id.toString()];

            if (!userJoinTime) {
                res.status(403);
                throw new Error("User is not part of this group or join time not recorded");
            }

            // Filter messages to include only those after user's join time
            query.createdAt = { $gte: new Date(userJoinTime) };
        }

        // Fetch the messages based on the constructed query
        const messages = await Message.find(query)
            .populate("sender", "firstName lastName image email")
            .populate({
                path: "chat",
                populate: {
                    path: "users groupAdmin",
                    select: "firstName lastName email",
                },
            });

        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});


//@description     Create New Message
//@route           POST /api/v1/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  if(req.body?.isFile && req.body.isFile  ){
    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        isFile:true,
      };
  }
  else{
    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        isFile:false,
      };
  }
  

  try {
    var message = await Message.create(newMessage);

    // maybe need to remove execPopulate
    message = await message.populate("sender", "firstName lastName image");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "firstName lastName image email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
