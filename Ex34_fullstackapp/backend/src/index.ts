import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

import productRouter from "./routes/productRouter";
import categoryRouter from "./routes/categoryRouter";
import orderRouter from "./routes/orderRouter";
import statusRouter from "./routes/statusRouter";
import authRouter from "./routes/authRouter";
import { authenticateToken } from "./middlewares/authMiddleware";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/products', authenticateToken, productRouter);
app.use('/categories', categoryRouter);
app.use('/orders', authenticateToken, orderRouter);
app.use('/status', statusRouter);

app.get('/ping', (req, res) => {
    res.json({ message: 'Ping!'}).status(200);
})

app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
});
