export const getDashboardStats = async (req, res) => {
  // À compléter avec des stats globales (utilisateurs, annonces, etc.)
  res.json({ success: true, data: { users: 0, listings: 0, payments: 0 } });
};
