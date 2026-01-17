import "./config/db.js";      // DB init
import app from "./app.js";  // Express app

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
