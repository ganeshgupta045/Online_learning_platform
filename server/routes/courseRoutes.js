const express = require("express");
const router = express.Router();

const Course = require("../models/Course");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

/* ================= CREATE COURSE (ADMIN ONLY) ================= */

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("admin"),
  upload.array("videos", 10), // Allow up to 10 videos to be uploaded at once
  async (req, res) => {
    try {
      const { title, description, price, domain } = req.body;

      // Because we use formData, data might be strings.
      // We expect the frontend to send an array of stringified `lectureData`
      // Or we can just expect `lectureTitles` and `isDemos` as parallel arrays to req.files
      let lectureTitles = [];
      let isDemos = [];

      // Parse arrays from FormData (FormData sends arrays as either multiple fields with the same name, or a comma-separated string)
      if (req.body.lectureTitles) {
        lectureTitles = Array.isArray(req.body.lectureTitles)
          ? req.body.lectureTitles
          : typeof req.body.lectureTitles === 'string' && req.body.lectureTitles.startsWith('[')
            ? JSON.parse(req.body.lectureTitles)
            : [req.body.lectureTitles];
      }

      if (req.body.isDemos) {
        isDemos = Array.isArray(req.body.isDemos)
          ? req.body.isDemos.map(d => d === 'true' || d === true)
          : typeof req.body.isDemos === 'string' && req.body.isDemos.startsWith('[')
            ? JSON.parse(req.body.isDemos)
            : [req.body.isDemos === 'true' || req.body.isDemos === true];
      }

      // Process uploaded files
      const videos = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          videos.push({
            title: lectureTitles[index] || `Lecture ${index + 1}`,
            videoUrl: `http://localhost:3000/uploads/videos/${file.filename}`, // Assuming localhost for development
            isDemo: isDemos[index] !== undefined ? isDemos[index] : (index === 0) // Make the first video a demo by default if none specified
          });
        });
      }

      const course = await Course.create({
        title,
        description,
        price: Number(price), // ensure price is number
        domain,
        videos,
        instructor: req.user._id,
      });

      res.status(201).json({
        message: "Course created successfully",
        course,
      });
    } catch (err) {
      console.error("CREATE COURSE ERROR:", err);
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

/* ================= UPDATE COURSE (ADMIN ONLY) ================= */

router.put(
  "/:courseId",
  authMiddleware,
  roleMiddleware("admin"),
  upload.array("videos", 10), // Allow uploading new videos during edit
  async (req, res) => {
    try {
      const { title, description, price, domain } = req.body;

      const course = await Course.findById(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Update text fields
      if (title) course.title = title;
      if (description) course.description = description;
      if (price) course.price = Number(price);
      if (domain) course.domain = domain;

      // Handle existing videos modification:
      // We expect `existingVideos` to be sent from the frontend holding the current state of videos
      if (req.body.existingVideos) {
        try {
          const existingVideosData = JSON.parse(req.body.existingVideos);
          course.videos = existingVideosData; // Update the state (e.g. changing titles, deleting old videos)
        } catch (e) {
          console.error("Failed to parse existingVideos", e);
        }
      }

      // Handle brand new files
      let lectureTitles = [];
      let isDemos = [];

      if (req.body.lectureTitles) {
        lectureTitles = Array.isArray(req.body.lectureTitles)
          ? req.body.lectureTitles
          : typeof req.body.lectureTitles === 'string' && req.body.lectureTitles.startsWith('[')
            ? JSON.parse(req.body.lectureTitles)
            : [req.body.lectureTitles];
      }
      if (req.body.isDemos) {
        isDemos = Array.isArray(req.body.isDemos)
          ? req.body.isDemos.map(d => d === 'true' || d === true)
          : typeof req.body.isDemos === 'string' && req.body.isDemos.startsWith('[')
            ? JSON.parse(req.body.isDemos)
            : [req.body.isDemos === 'true' || req.body.isDemos === true];
      }

      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          course.videos.push({
            title: lectureTitles[index] || `New Lecture ${course.videos.length + 1}`,
            videoUrl: `http://localhost:3000/uploads/videos/${file.filename}`,
            isDemo: isDemos[index] !== undefined ? isDemos[index] : false
          });
        });
      }

      await course.save();

      res.status(200).json({
        message: "Course updated successfully",
        course,
      });
    } catch (err) {
      console.error("UPDATE COURSE ERROR:", err);
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

/* ================= DELETE COURSE (ADMIN ONLY) ================= */

router.delete(
  "/:courseId",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      await Course.findByIdAndDelete(req.params.courseId);

      res.status(200).json({
        message: "Course deleted successfully",
      });
    } catch (err) {
      console.error("DELETE COURSE ERROR:", err);
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

/* ================= ENROLL COURSE ================= */

router.post("/:courseId/enroll", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot enroll" });
    }

    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();

    res.json({ message: "Enrolled successfully" });

  } catch (err) {
    console.error("ENROLL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET MY COURSES (ENROLLED FOR STUDENTS, CREATED FOR ADMINS) ================= */

router.get("/my-courses", authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      // Admins see courses they created
      query = { instructor: req.user.id };
    } else {
      // Students see courses they are enrolled in
      query = { enrolledStudents: req.user.id };
    }

    const courses = await Course.find(query).populate("instructor", "username email");

    res.json(courses);
  } catch (err) {
    console.error("MY COURSES ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ================= GET ALL COURSES ================= */

router.get("/", async (req, res) => {
  try {
    const { domain, instructor } = req.query;
    let query = {};
    if (domain) {
      query.domain = domain;
    }
    if (instructor) {
      query.instructor = instructor;
    }
    const courses = await Course.find(query).populate("instructor", "username email");
    res.json(courses);
  } catch (err) {
    console.error("GET COURSES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET SINGLE COURSE ================= */

router.get("/:courseId", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("instructor", "username email")
      .populate("enrolledStudents", "username email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);

  } catch (err) {
    console.error("GET SINGLE COURSE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;