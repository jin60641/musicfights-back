import crypto from 'crypto';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    verify : { type : DataTypes.BOOLEAN, defaultValue : false },
  }, {
    timestamps: true,
    paranoid: true,
    hooks: {
      afterValidate: function(user) {
        if (user.password) {
          user.password = User.createHashedPassword(user.password);
        }
      }
    },
  });

  User.createHashedPassword = function (source) {
    const shasum = crypto.createHash('sha1');
    return shasum.update(source).digest('hex');
  };

  return User;
};
