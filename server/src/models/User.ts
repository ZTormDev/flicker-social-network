import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

interface UserAttributes {
  id?: number; // Making id optional
  username: string;
  email: string;
  passwordHash: string;
  userImage?: string; // Add userImage property
  created_at?: Date;
  updated_at?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public passwordHash!: string;
  public userImage!: string; // Add userImage property
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
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
    },
    userImage: {
      // Add userImage property
      type: DataTypes.STRING(255),
      allowNull: true, // Allow null values for userImage
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true, // Sequelize will handle timestamps automatically
    underscored: true, // Use snake_case for column names
  }
);
