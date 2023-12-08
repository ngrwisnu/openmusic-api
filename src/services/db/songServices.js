class SongServices {
  constructor() {}

  addSong({ title, year, genre, performer, duration = 0, albumId = "" }) {}

  getSongs() {}

  getSongById(id) {}

  editSongById(
    id,
    { title, year, genre, performer, duration = 0, albumId = "" }
  ) {}

  deleteSongById(id) {}
}

export default SongServices;
