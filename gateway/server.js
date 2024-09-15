const app = require("./src/app");
const port = process.env.PORT || 3050;
const hostname = "0.0.0.0";
const { getUserId } = require("./src/auth/authUtils");
const { continuousConsumer } = require("./src/message_queue/consumer");

const server = app.listen(port, hostname, () => {
  console.log(`Server running on port ${port}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// Khai báo Map để lưu trữ thông tin kết nối người dùng
var userSockets = [];

io.on("connection", async (socket) => {
  // Sửa "connect" thành "connection"
  console.log("A user connected", socket.id);

  // Đăng ký ID người dùng khi họ gửi sự kiện 'register'
  socket.on("register", async (userId) => {
    if (userId) {
      console.log(`User ${userId} registered with socket ID ${socket.id}`);
      try {
        const user_id = await getUserId(userId, process.env.PUBLIC_KEY);
        socket.userId = user_id;
        userSockets.push(socket.userId);
      } catch (e) {
        console.error(e);
      }
    }
  });

  socket.on("chat message", (msg) => {
    console.log("Message received:", JSON.stringify(msg));
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    userSockets.splice(userSockets.indexOf(socket.userId), 1);
    console.log("list user:::", userSockets);
  });
});

// Truyền io vào Kafka consumer
continuousConsumer(io).catch(console.error);
