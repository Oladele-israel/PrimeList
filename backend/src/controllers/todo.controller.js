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

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  const formatDate = (date) => {
    if (!date) return null;
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

// Read Todos
export const getTodos = async (req, res) => {
  const userId = req.user.id;
  const { status } = req.query;

  try {
    let query = `SELECT * FROM todos WHERE user_id = $1 AND deleted_at IS NULL`;
    const values = [userId];

    if (status) {
      query += ` AND status = $2`;
      values.push(status);
    }

    const result = await pool.query(query, values);
    return res.status(200).json({
      success: true,
      message: "Todos fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching todos:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching todos",
    });
  }
};

// Get Todo by ID
export const getTodoById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const query = `SELECT * FROM todos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;`;
    const values = [id, userId];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Todo details fetched successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching todo details:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the todo details",
    });
  }
};

// Update Todo
export const updateTodo = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, status, dueDate, reminderDate } =
    req.body;
  const userId = req.user.id;

  const formatDate = (date) => {
    if (!date) return null;
    const [day, month, year] = date
      .split("/")
      .map((item) => parseInt(item, 10));
    return new Date(year, month - 1, day).toISOString().split("T")[0];
  };

  const formattedDueDate = formatDate(dueDate);
  const formattedReminderDate = formatDate(reminderDate);

  try {
    const query = `
      UPDATE todos
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          priority = COALESCE($3, priority),
          status = COALESCE($4, status),
          due_date = COALESCE($5, due_date),
          reminder_date = COALESCE($6, reminder_date),
          updated_at = NOW()
      WHERE id = $7 AND user_id = $8 AND deleted_at IS NULL
      RETURNING *;
    `;

    const values = [
      title || null,
      description || null,
      priority || null,
      status || null,
      formattedDueDate,
      formattedReminderDate,
      id,
      userId,
    ];

    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Todo updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the todo",
    });
  }
};

// Soft Delete Todo
export const softDeleteTodo = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const query = `
      UPDATE todos
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      RETURNING *;
    `;
    const values = [id, userId];

    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Todo soft deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error soft deleting todo:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while soft deleting the todo",
    });
  }
};

// Permanent Delete Todo
export const deleteTodo = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const query = `DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *;`;
    const values = [id, userId];

    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Todo permanently deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the todo",
    });
  }
};
