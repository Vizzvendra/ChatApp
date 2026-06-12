const express = require("express");
const http = require("http"); // Added to create an HTTP server
const socketIo = require("socket.io"); // Added for Socket.IO
const app = express();
const passport = require('passport');
const session = require("express-session");

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const contactUsRoute = require("./routes/Contact");
const chatRoutes = require("./routes/chatroutes");
const messageRoutes = require("./routes/messageRoutes");
const googleRoutes = require("./routes/googleroutes");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const {cloudinaryConnect } = require("./config/cloudinary");
const { generateUploadURL,generateDownloadUrl } =require('./config/s3');
const cors = require("cors");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

const Document = require("./models/Document")

dotenv.config();
const PORT = process.env.PORT || 4000;

require("./config/passport");
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
	cors({
		origin: process.env.FRONTEND_LINK,
		credentials:true,
	})
)
app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)

cloudinaryConnect();

// Passport and session setup
app.use(
    session({
      secret: process.env.SESSION_SECRET || "your_secret_key",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

//routes
app.use("/api/v1/google",googleRoutes);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);

// Get change log for a document
app.get("/api/v1/documents/:id", async (req, res) => {
    try {

        console.log("Fetching document with id:", req.params.id);
        const document = await Document.findOne({ _id: req.params.id }).populate("changeLog.user", "firstName lastName  email");
        console.log("Document found:", document);
       
        if (!document) return res.status(404).json({ message: "Document not found" });

        
        let textContent = "";
        let interpretDelta = (delta) => {
            if (!delta || !delta.ops) return "No details available.";
            let index = 0; 
            let changes = []; // To store the change log output
            
            delta.ops.forEach((op) => {
              if (op.retain) {
                // Retain the specified number of characters, increment the index accordingly
                index += op.retain;
              }
          
              if (op.insert) {
                // Insert at the current position
                const insertText = typeof op.insert === 'string' ? op.insert : '[Image/Embed]';
                const formattedInsert = insertText
                .replace(/ /g, "[Space]")
                .replace(/\n/g, "[NewLine]")
                .replace(/\t/g, "[Tab]"); // Format whitespaces for display
                textContent = textContent.slice(0, index) + insertText + textContent.slice(index);
                index += insertText.length; // Move the index forward by the length of the inserted text
                changes.push(`Inserted: "${formattedInsert}" at position ${index - insertText.length}`);
              }
          
              if (op.delete) {
                // Delete the specified number of characters starting from the current position
                const deletedText = textContent.slice(index, index + op.delete);
                const formattedDelete = deletedText
                .replace(/ /g, "[Space]")
                .replace(/\n/g, "[NewLine]")
                .replace(/\t/g, "[Tab]"); // Format whitespaces for display
                textContent = textContent.slice(0, index) + textContent.slice(index + op.delete);
                changes.push(`Deleted: "${formattedDelete}" from position ${index}`);
              }
            });
          
            return changes.join("\n");
          };
          
      
          const changeLogWithDetails = document.changeLog.map(log => {
              try {
                  return {
                      user: log.user,
                      timestamp: log.timestamp,
                      changes: interpretDelta(log.delta),
                  };
              } catch(e) {
                  console.error("Error processing log:", e);
                  return {
                      user: log.user,
                      timestamp: log.timestamp,
                      changes: "Error processing change",
                  };
              }
          });

        res.json(changeLogWithDetails);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

app.post('/api/v1/s3Url', async (req, res) => {
    try {
        const { fileName } = req.body;
      const { uploadURL, key } = await generateUploadURL(fileName);
      res.status(200).json({
        success: true,
        uploadURL,
        key,
      });
    } catch (error) {
      console.error('Error in upload URL endpoint:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate upload URL. Please try again later.',
      });
    }
  });
  
  app.get('/api/v1/s3Url/download', async (req, res) => {
    try {
      const key = req.query.fileUrl;
  
      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'File URL is required.',
        });
      }
  
      const url = await generateDownloadUrl(key);
      
  
      res.status(200).json({
        success: true,
        url,
      });
    } catch (error) {
      console.error('Error in download URL endpoint:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate download URL. Please try again later.',
      });
    }
  });
  
  

//default route
app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

const server=app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})

// const server = http.createServer(app); // Create an HTTP server using the Express app
const io = socketIo(server, {
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["polling", "websocket"],
    cors: {
        origin: "*",
        credentials: true,
    }
});

const defaultValue = ""
// Socket.IO setup
io.on("connection", (socket) => {
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });
  
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;
  
      if (!chat.users) return console.log("chat.users not defined");
  
      chat.users.forEach((user) => {
        if (user._id !== newMessageRecieved.sender._id) 
        socket.in(user._id).emit("message received", newMessageRecieved);
      });
    });

    socket.on("update group", (groupData) => {
        socket.in(groupData._id).emit("group update again",groupData);

        groupData.users.forEach((user) => {
          socket.in(user._id).emit("group update", groupData);
        });
      });

    socket.on("get-document", async documentId => {
        if (!documentId) {
            console.error("No documentId provided for get-document");
            return;
          }
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId)
        socket.emit("load-document", document.data)

        socket.removeAllListeners("send-changes");
        socket.on("send-changes",async ({delta,userId}) => {
            if (!documentId) {
                console.error("No documentId provided for send-changes");
                return;
            }
            socket.to(documentId).emit("receive-changes", delta);
            try {
                // Update the changeLog in the database for the specific document
                await Document.findOneAndUpdate({ _id: documentId }, {
                $push: {
                    changeLog: {
                    user: userId,
                    delta,
                    },
                },
                lastModifiedBy: userId,
                });
            } catch (error) {
                console.error(`Error updating changeLog for document ${documentId}:`, error);
            }
        })
    
        socket.removeAllListeners("save-document");
        socket.on("save-document", async ({ data, userId }) => {
            if (!documentId) {
              console.error("No documentId provided");
              return;
            }
          
            try {
              await Document.findOneAndUpdate({ _id: documentId }, {
                data,
                lastModifiedBy: userId,
              });
            } catch (error) {
              console.error("Error updating document:", error);
            }
          });
          
    })

    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
      });
  
  }
);


async function findOrCreateDocument(id) {
    if (!id) {
        throw new Error("Document ID is required.");
    }

    const document = await Document.findOne({ _id: id });
  if (document) return document;
  return await Document.create({ _id: id, data: "" });
}
  