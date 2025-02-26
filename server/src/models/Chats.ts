import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export class Chat extends Model {
  public id!: number;
  public user1Id!: number;
  public user2Id!: number;
  public lastMessageAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Chat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user1Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user2Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "chats",
    indexes: [
      {
        unique: true,
        fields: ["user1Id", "user2Id"],
      },
    ],
  }
);
