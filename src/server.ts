import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import "./cron/contractStatusCron";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running on http://localhost:${PORT}`);
});