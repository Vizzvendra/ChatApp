const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
  updateHistoryVisibility
} = require("../controllers/chatControllers");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.route("/").post(auth, accessChat);
router.route("/").get(auth, fetchChats);
router.route("/update-history-visibility").put(auth, updateHistoryVisibility);
router.route("/group").post(auth, createGroupChat);
router.route("/rename").put(auth, renameGroup);
router.route("/groupremove").put(auth, removeFromGroup);
router.route("/groupadd").put(auth, addToGroup);

module.exports = router;
