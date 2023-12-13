exports.up = (pgm) => {
  pgm.createType("activity", ["ADD", "DELETE"]);
};

exports.down = (pgm) => {
  pgm.dropType("activity");
};
