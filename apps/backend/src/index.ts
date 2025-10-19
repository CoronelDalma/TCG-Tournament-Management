import { saludo  } from "../../../domain/dist/index.js";
import { registerUser, loginUser, UserService, User, UserRole } from "../../../domain/dist/index.js";
console.log("Backend service started");
console.log(saludo);
import app from "./server.js"

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});