export async function getUsers(req, res) {
  res.json(
    [
      {
        id: 1,
        name: "James"
      }
    ]
  );
}

export async function getUserById(req, res) {
  const { id } = req.params;
  res.json(
    {
      id,
      name: "James"
    }
  );
}