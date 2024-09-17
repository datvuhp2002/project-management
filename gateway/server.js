const app = require("./src/app");
const port = process.env.PORT || 3050;
const hostname = "0.0.0.0";
const { verifyJWT } = require("./src/auth/authUtils");
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
let userSockets = new Map();

// Middleware xác thực trước khi tiếp tục kết nối
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token; // Nhận token từ client
  if (!token) {
    return next(new Error("Authentication error")); // Ngắt kết nối nếu không có token
  }
  try {
    // Xác thực token và lấy user_id
    const payload = await verifyJWT(token, process.env.PUBLIC_KEY);
    // Gán userId vào socket
    socket.userId = payload.userId;
    userSockets.set(payload.userId, socket.id);
    // Xác thực thành công
    next();
  } catch (error) {
    console.error("Authentication failed:", error.message);
    next(new Error("Authentication failed")); // Ngắt kết nối nếu token không hợp lệ
  }
});

io.on("connection", (socket) => {
  console.log(
    `User ${JSON.stringify(socket.userId)} connected with socket ID ${
      socket.id
    }`
  );

  socket.on("disconnect", () => {
    console.log(
      `User ${JSON.stringify(socket.userId)} disconnected`,
      socket.id
    );
    userSockets.delete(socket.userId);
    // console.log("USER:::", userSockets);
    // console.log("Active users:", Array.from(userSockets.keys()));
  });
});

// Truyền io vào Kafka consumer
continuousConsumer(io, userSockets).catch(console.error);
