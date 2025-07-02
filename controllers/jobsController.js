const jobs = [
    { id: 1, title: "Software Engineer", description: "Build cool apps." },
    { id: 2, title: "QA Analyst", description: "Test the software." },
    { id: 3, title: "Project Manager", description: "Manage projects and teams." },
  ];
  
  exports.listJobs = (req, res) => {
    res.render("jobs", { jobs });
  };
  
  exports.showJob = (req, res) => {
    const id = parseInt(req.params.id);
    const job = jobs.find((j) => j.id === id);
    if (!job) {
      return res.status(404).send("Job not found");
    }
    res.render("job", { job });
  };