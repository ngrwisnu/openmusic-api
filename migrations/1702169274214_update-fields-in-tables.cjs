exports.up = (pgm) => {
  pgm.renameColumn("songs", "albumId", "album_id");
  pgm.alterColumn("songs", "album_id", {
    type: "VARCHAR(50)",
  });
};

exports.down = (pgm) => {
  pgm.renameColumn("songs", "album_id", "albumId");
};
