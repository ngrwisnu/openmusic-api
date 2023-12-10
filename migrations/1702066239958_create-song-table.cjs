exports.up = (pgm) => {
  pgm.createTable("songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      unique: true,
      notNull: true,
    },
    title: {
      type: "TEXT",
      notNull: true,
    },
    year: {
      type: "SMALLINT",
      notNull: true,
    },
    genre: {
      type: "TEXT",
      notNull: true,
    },
    performer: {
      type: "TEXT",
      notNull: true,
    },
    duration: {
      type: "SMALLINT",
      notNull: false,
    },
    albumId: {
      type: "TEXT",
      notNull: false,
      references: "albums",
    },
    created_at: {
      type: "TEXT",
      notNull: true,
    },
    updated_at: {
      type: "TEXT",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("songs");
};
