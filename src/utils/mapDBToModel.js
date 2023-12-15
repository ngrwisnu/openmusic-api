export const mapActivityOutput = (data) => ({
  username: data.username,
  title: data.title,
  action: data.action.toLowerCase(),
  time: data.created_at,
});

export const mappedAlbumOutput = (data) => ({
  id: data.id,
  name: data.name,
  year: data.year,
  coverUrl: data.cover,
});
