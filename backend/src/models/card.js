const db = require('../db');

// All snake_case field names match the Prisma schema exactly
const Card = {
  findAllByUser: (userId) =>
    db.card.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' } }),

  findById: (id) =>
    db.card.findUnique({ where: { id } }),

  findByIdAndUser: (id, userId) =>
    db.card.findFirst({ where: { id, user_id: userId } }),

  create: ({ userId, type, name, title, company, email, phone, website, logo_url, photo_url, color, stamps_total }) =>
    db.card.create({
      data: {
        user_id: userId, type, name,
        title:    title    || null,
        company:  company  || null,
        email:    email    || null,
        phone:    phone    || null,
        website:  website  || null,
        logo_url: logo_url || null,
        photo_url: photo_url || null,
        color:    color || '#1a73e8',
        stamps_total: stamps_total || 10,
      },
    }),

  update: (id, fields) => {
    const allowed = ['name','title','company','email','phone','website',
                     'logo_url','photo_url','color','stamps_total','stamps_current','pass_object_id'];
    const data = {};
    for (const key of allowed) {
      if (fields[key] !== undefined) data[key] = fields[key];
    }
    if (Object.keys(data).length === 0) return db.card.findUnique({ where: { id } });
    return db.card.update({ where: { id }, data });
  },

  delete: (id, userId) =>
    db.card.deleteMany({ where: { id, user_id: userId } }),
};

module.exports = Card;
