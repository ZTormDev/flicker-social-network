import { User } from "./User";
import { Chat } from "./Chats";
import { Message } from "./Messages";

// Chat associations
Chat.belongsTo(User, { as: "user1", foreignKey: "user1Id" });
Chat.belongsTo(User, { as: "user2", foreignKey: "user2Id" });
Chat.hasMany(Message, { as: "messages", foreignKey: "chatId" });

// Message associations
Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Message.belongsTo(Chat, { as: "chat", foreignKey: "chatId" });

// User associations related to chats
User.hasMany(Chat, { as: "chats1", foreignKey: "user1Id" });
User.hasMany(Chat, { as: "chats2", foreignKey: "user2Id" });
User.hasMany(Message, { as: "sentMessages", foreignKey: "senderId" });
