import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productRouter from "./routes/productRouter";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('products', productRouter);

app.get('/ping', (req, res) => {
    res.json({ message: 'Ping!'}).status(200);
})

app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
});
