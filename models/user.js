export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    phone: { type: DataTypes.STRING(100), allowNull: false },
  }, {
    timestamps: true,
    paranoid: true,
  });

  return User;
};
