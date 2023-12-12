exports.up = (pgm) => {
  pgm.createTable("tokens", {
    id: {
      type: "SERIAL",
      notNull: true,
    },
    token: {
      type: "TEXT",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("tokens");
};
