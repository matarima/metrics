const express = require("express");
const metricRoutes = require("./routes/metrics");
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://thinhmx:admin@cluster0.eksxo77.mongodb.net/metrics?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });
const app = express();
app.use(express.json());

app.use("/api", metricRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
