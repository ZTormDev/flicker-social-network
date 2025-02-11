import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

interface FollowsAttributes {
  id?: number;
  follower_id: number;
  following_id: number;
  created_at?: Date;
}

export class Follows
  extends Model<FollowsAttributes>
  implements FollowsAttributes
{
  public id!: number;
  public follower_id!: number;
  public following_id!: number;
  public created_at!: Date;
}

Follows.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    following_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
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
    tableName: "follows",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["follower_id", "following_id"],
      },
    ],
  }
);

// Define associations
Follows.belongsTo(User, { foreignKey: "follower_id", as: "Follower" });
Follows.belongsTo(User, { foreignKey: "following_id", as: "Following" });
User.hasMany(Follows, { foreignKey: "follower_id", as: "Following" });
User.hasMany(Follows, { foreignKey: "following_id", as: "Followers" });

export default Follows;
