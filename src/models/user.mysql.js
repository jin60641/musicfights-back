import crypto from 'crypto';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING(32), allowNull: false },
    handle: { type: DataTypes.STRING(32), allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    verify: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    timestamps: true,
    paranoid: true,
    hooks: {
      afterValidate(user) {
        if (user.password) {
          user.password = User.createHashedPassword(user.password);
        }
      },
    },
  });

  User.createHashedEmail = function (source) {
    const shasum = crypto.createHash('sha1');
    return shasum.update(source).digest('hex');
  };

  User.createHashedPassword = function (source) {
    const shasum = crypto.createHash('sha1');
    return shasum.update(source).digest('hex');
  };

  return User;
};
