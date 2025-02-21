import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { Post } from "./Post";

interface LikeAttributes {
  id?: number;
  user_id: number;
  post_id: number;
  created_at?: Date;
}

export class Like extends Model<LikeAttributes> implements LikeAttributes {
  public id!: number;
  public user_id!: number;
  public post_id!: number;
  public created_at!: Date;
}

Like.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "likes",
    timestamps: false,
    underscored: true,
  }
);

// Add associations
Like.belongsTo(User, { foreignKey: "user_id", as: "User" });
Like.belongsTo(Post, { foreignKey: "post_id", as: "Post" });
Post.hasMany(Like, { foreignKey: "post_id", as: "Likes" });
User.hasMany(Like, { foreignKey: "user_id", as: "Likes" });

export default Like;
