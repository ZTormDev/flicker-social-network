import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

interface PostAttributes {
  id?: number;
  content: string;
  user_id: number;
  expires_at: Date;
  created_at?: Date;
  updated_at?: Date;
  media?: string;
}

export class Post extends Model<PostAttributes> implements PostAttributes {
  public id!: number;
  public content!: string;
  public user_id!: number;
  public expires_at!: Date;
  public created_at!: Date;
  public updated_at!: Date;
  public media!: string;
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
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    media: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "posts",
    timestamps: true,
    underscored: true, // This ensures created_at instead of createdAt
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Post.belongsTo(User, { foreignKey: "user_id", as: "User" });
User.hasMany(Post, { foreignKey: "user_id", as: "posts" });

export default Post;
