import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

interface PostAttributes {
  id?: number;
  content: string;
  user_id: number;
  expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export class Post extends Model<PostAttributes> implements PostAttributes {
  public id!: number;
  public content!: string;
  public user_id!: number;
  public expires_at!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      field: "user_id", // Specify the snake_case field name
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at", // Specify the snake_case field name
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at", // Specify the snake_case field name
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at", // Specify the snake_case field name
    },
  },
  {
    sequelize,
    tableName: "posts",
    timestamps: true,
    underscored: true, // This will convert created_at to created_at, etc.
  }
);

Post.belongsTo(User, {
  foreignKey: "user_id",
  as: "User", // Add this line
});
User.hasMany(Post, {
  foreignKey: "user_id",
  as: "posts", // Add this line
});

export default Post;
