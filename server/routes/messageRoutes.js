const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");

const { auth } = require("../middlewares/auth");

const router = express.Router();

router.route("/:chatId").get(auth, allMessages);
router.route("/").post(auth, sendMessage);

module.exports = router;
