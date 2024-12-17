import express from "express";
import {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  softDeleteTodo,
  getTodoById,
} from "../controllers/todo.controller.js";
import { checkAndRenewToken } from "../middleware/validateToken.js";

const todoRouter = express.Router();

todoRouter.post("/create", checkAndRenewToken, createTodo);
todoRouter.get("/getTodo", checkAndRenewToken, getTodos);
todoRouter.get("/:id/getById", checkAndRenewToken, getTodoById);
todoRouter.put("/:id/updateTodo", checkAndRenewToken, updateTodo);
todoRouter.delete("/:id/deleteTodo", checkAndRenewToken, deleteTodo);
todoRouter.patch("/:id/softDelete", checkAndRenewToken, softDeleteTodo);

export default todoRouter;
