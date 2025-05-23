import express from "express";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/ratelimiter.js";
const PORT = process.env.PORT || 8000;
const app = express();


// middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(limiter);


app.get("/", (req, res) => {
  return res.json({ message: "Hello It's working.." });
});

// * Import routes
import ApiRoutes from "./routes/api.js";
app.use("/api", ApiRoutes);



app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));