const db = require('../db');

// All methods return Promises (Prisma is async)
const User = {
  findByEmail: (email) =>
    db.user.findUnique({ where: { email } }),

  findById: (id) =>
    db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, subscription: true, created_at: true },
    }),

  create: ({ email, password, name }) =>
    db.user.create({ data: { email, password, name } }),

  updateSubscription: (id, subscription) =>
    db.user.update({ where: { id }, data: { subscription } }),
};

module.exports = User;
