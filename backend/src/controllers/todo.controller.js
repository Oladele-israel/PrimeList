import pool from "../utils/db.js";

export const createTodo = async (req, res) => {
  const {
    title,
    description,
    priority = "medium",
    status = "pending",
    dueDate,
    reminderDate,
  } = req.body;

  const userId = req.user.id;

  // Validate required fields
  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  // Convert human-readable dates (DD/MM/YYYY) to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return null;
    // Check if date is in DD/MM/YYYY format
    const [day, month, year] = date
      .split("/")
      .map((item) => parseInt(item, 10));
    return new Date(year, month - 1, day).toISOString().split("T")[0];
  };

  const formattedDueDate = formatDate(dueDate);
  const formattedReminderDate = formatDate(reminderDate);

  try {
    const query = `
        INSERT INTO todos (user_id, title, description, priority, status, due_date, reminder_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
      `;
    const values = [
      userId,
      title,
      description,
      priority,
      status,
      formattedDueDate,
      formattedReminderDate,
    ];

    const result = await pool.query(query, values);
    return res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating todo:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the todo",
    });
  }
};
