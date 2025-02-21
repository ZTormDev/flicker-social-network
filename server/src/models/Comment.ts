import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { Post } from "./Post";

interface CommentAttributes {
  id: number;
  content: string;
  user_id: number;
  post_id: number;
  created_at: Date;
}

interface CommentCreationAttributes
  extends Omit<CommentAttributes, "id" | "created_at"> {}

export class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  public id!: number;
  public content!: string;
  public user_id!: number;
  public post_id!: number;
  public created_at!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    post_id: {
      type: DataTypes.BIGINT,
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
    tableName: "comments",
    timestamps: false,
    underscored: true,
  }
);

// Establecer las relaciones
Comment.belongsTo(User, { foreignKey: "user_id" });
Comment.belongsTo(Post, { foreignKey: "post_id" });
Post.hasMany(Comment, { foreignKey: "post_id" });
