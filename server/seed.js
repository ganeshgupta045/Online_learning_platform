const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Course = require("./models/Course");
const User = require("./models/User");

dotenv.config();

const UNSPLASH_IMAGES = {
    "General": [
        "https://images.unsplash.com/photo-1513258496099-48168024aec0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ],
    "Artificial Intelligence": [
        "https://images.unsplash.com/photo-1527430253228-e93688616381?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1625314887424-9f190599bd56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1620825937374-87fc7d628302?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ],
    "Web Development": [
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565106430482-8f6e1f34f411?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1557821552-17105153ce9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1618477247222-accd0fac2af7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ],
    "Data Science": [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1614064641936-382aae43ec47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1543286386-2e659306cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1500315331616-db4f707c24d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ],
    "Mobile Development": [
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1526498460520-4c246339dccb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1537498425277-c283d32ef9db?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1601972599720-36938d4ecd31?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ]
};

const COURSE_TITLES = {
    "General": ["Digital Marketing Mastery", "Project Management Basics", "Public Speaking Pro", "Time Management Tricks", "Financial Literacy 101", "Graphic Design Essentials", "Freelancing Freedom", "Photography Masterclass", "Yoga for Beginners", "Healthy Cooking Made Easy"],
    "Artificial Intelligence": ["Generative AI Foundations", "Machine Learning with Python", "Deep Learning & Neural Networks", "AI for Business Leaders", "Natural Language Processing", "Computer Vision Tactics", "Reinforcement Learning", "ChatGPT Prompt Engineering", "AI Ethics and Governance", "Building LLMs from Scratch"],
    "Web Development": ["Full Stack Web Bootcamp", "React Native for Web", "Advanced Node.js & Express", "Modern CSS & Tailwind", "Next.js 14 Mastery", "Vue.js & Nuxt Fundamentals", "Frontend Architecture", "RESTful API Design", "Web Security Practices", "GraphQL Integration"],
    "Data Science": ["Python for Data Analysis", "SQL & Database Design", "Data Visualization with Tableau", "Statistics for Data Scientists", "Big Data Analytics with Spark", "R Programming Bootcamp", "Predictive Modeling", "Time Series Analysis", "Data Mining Techniques", "Business Intelligence Essentials"],
    "Mobile Development": ["iOS Apps with Swift", "Flutter for iOS & Android", "Android Dev with Kotlin", "React Native CLI", "Mobile UI/UX Design", "SwiftUI Essentials", "Advanced Android Architecture", "Cross-Platform App Building", "App Store Optimization", "Game Dev for Mobile"]
};

// Generates a mock video array
const getMockVideos = () => {
    return [
        { title: "Introduction & Setup", videoUrl: "http://localhost:3000/uploads/videos/mock1.mp4", isDemo: true },
        { title: "Core Concepts", videoUrl: "http://localhost:3000/uploads/videos/mock2.mp4", isDemo: false },
        { title: "Advanced Techniques", videoUrl: "http://localhost:3000/uploads/videos/mock3.mp4", isDemo: false },
        { title: "Project Walkthrough", videoUrl: "http://localhost:3000/uploads/videos/mock4.mp4", isDemo: false },
        { title: "Conclusion", videoUrl: "http://localhost:3000/uploads/videos/mock5.mp4", isDemo: false },
    ]
}

const seedDatabase = async () => {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected for Seeding");

        // 2. Clear existing Courses and Users (keeping it clean)
        await Course.deleteMany();
        await User.deleteMany();
        console.log("🧹 Cleared old Courses and Users");

        // 3. Create a mock Admin User (instructor for all courses)
        const adminUser = await User.create({
            username: "AdminInstructor",
            email: "admin@test.com",
            password: "password123", // In a real app we'd hash this, but we'll bypass controller here. Or let's use bcrypt to be safe.
            role: "admin"
        });
        console.log("👨‍🏫 Created Admin User");

        // We'll manually hash password here so we can actually log in with it later
        const bcrypt = require("bcryptjs");
        const salt = await bcrypt.genSalt(10);
        adminUser.password = await bcrypt.hash("admin123", salt);
        await adminUser.save();

        // 4. Generate 50 Courses
        const coursesToInsert = [];

        // We will distribute the images and titles
        for (const [domain, titles] of Object.entries(COURSE_TITLES)) {
            for (let i = 0; i < 10; i++) {
                const price = Math.floor(Math.random() * (4999 - 499 + 1)) + 499; // Random price between 499 and 4999

                coursesToInsert.push({
                    title: titles[i],
                    description: `A comprehensive guide covering everything you need to know about ${titles[i]}. Designed for beginners to advanced practitioners. Join thousands of students who have mastered this topic!`,
                    domain: domain,
                    price: price,
                    thumbnail: UNSPLASH_IMAGES[domain][i],
                    instructor: adminUser._id,
                    videos: getMockVideos()
                });
            }
        }

        await Course.insertMany(coursesToInsert);
        console.log(`🌱 Seeding Complete. Inserted ${coursesToInsert.length} Courses!`);
        console.log("Admin account credentials: Email: admin@test.com, Password: admin123");

        process.exit();
    } catch (error) {
        console.error("❌ Seeding Error:", error);
        process.exit(1);
    }
};

seedDatabase();
