import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

interface UserAttributes {
  id?: number;
  username: string;
  email: string;
  passwordHash: string;
  userImage?: string;
  created_at?: Date;
  followers: number;
  following: number;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public passwordHash!: string;
  public userImage!: string;
  public followers!: number;
  public following!: number;
  public readonly created_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.CHAR(60),
      allowNull: false,
      field: "password_hash",
    },
    userImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "user_image",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    followers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    following: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false,
    underscored: true,
  }
);
