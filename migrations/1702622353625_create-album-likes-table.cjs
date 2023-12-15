exports.up = (pgm) => {
  pgm.createTable("album_likes", {
    id: {
      type: "VARCHAR(50)",
      notNull: true,
      primaryKey: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    album_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "albums",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("album_likes");
};
