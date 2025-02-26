import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export class Message extends Model {
  public id!: number;
  public content!: string;
  public senderId!: number;
  public chatId!: number;
  public read!: boolean;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "messages",
  }
);
