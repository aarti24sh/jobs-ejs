const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobsController");
const auth = require("../middleware/auth");

// Protect jobs routes so only logged-in users can access
router.use(auth);

router.get("/", jobsController.listJobs);
router.get("/:id", jobsController.showJob);

module.exports = router;