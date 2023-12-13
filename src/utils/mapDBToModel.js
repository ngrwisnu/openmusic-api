export const mapActivityOutput = (data) => ({
  username: data.username,
  title: data.title,
  action: data.action.toLowerCase(),
  time: data.created_at,
});
