import { Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();

interface Todo {
    id: string,
    text: string
}

let todos: Todo[] = [];

router.get('/todos', (ctx) => {
    ctx.response.body = { todos: todos };
})

router.post('/todos', async (ctx) => {
    const data = await ctx.request.body();
    const newTodo: Todo = {
        id: new Date().toISOString(),
        text: data.value.text
    };
    todos.push(newTodo);
    ctx.response.body = { message: "Created Todo", newTodo: newTodo }    
})

router.put('/todos/:todoId', async (ctx) => {
    const todoId = ctx.params.todoId;
    const data = await ctx.request.body();
    const todoIndex = todos.findIndex((todo) => { return todo.id === todoId });
     todos[todoIndex] = {id: todos[todoIndex].id, text: data.value.text };
     ctx.response.body = {message: "Updated Todo", todos: todos}
})

router.delete('/todos/:todoId', (ctx) => {
    const todoId = ctx.params.todoId;
    todos = todos.filter(todo => todo.id != todoId);
    ctx.response.body = {message: "Deleted Todo", todos: todos}
})

export default router;