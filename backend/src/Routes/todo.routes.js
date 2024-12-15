import express from "express";
import { createTodo } from "../controllers/todo.controller.js";
import { checkAndRenewToken } from "../middleware/validateToken.js";

const todoRouter = express.Router();

todoRouter.post("/create", checkAndRenewToken, createTodo);

export default todoRouter;
