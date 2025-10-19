import express from 'express';

const router = express.Router();
router.get("/ping", (req, res) => {
    res.send("pong");
});


// router.post('/register', async (req, res) => {
//     try {
//         const user = await registerUser({
//             dependencies: { userService },
//             payload: { data: req.body }
//         });
//         res.status(201).json(user);
//     } catch (error: any) {
//         res.status(400).json({ error: error.message });
//     }
// })

// router.post('/login', async (req, res) => {
//     try {
//         const result = await loginUser({    
//             dependencies: { userService, authService },
//             payload: { data: req.body }
//         });
//         res.status(200).json(result);
//     } catch (error: any) {
//         res.status(400).json({ error: error.message });
//     }   
// });

export default router;
