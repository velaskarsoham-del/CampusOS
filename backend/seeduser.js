const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/user");

const users = [
  {
    full_name: "CampusOS Principal",
    email: "principal@campusos.com",
    password: "Admin@123",
    role: "admin",
  },
  {
    full_name: "CampusOS Teacher",
    email: "teacher@campusos.com",
    password: "Teacher@123",
    role: "faculty",
  },
  {
    full_name: "CampusOS Student",
    email: "student@campusos.com",
    password: "Student@123",
    role: "student",
  },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(
        userData.password,
        10
      );

      const user = await User.findOneAndUpdate(
        { email: userData.email },
        {
          full_name: userData.full_name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(
        `Created/updated ${user.role}: ${user.full_name}`
      );
    }

    console.log("\nAll users processed successfully.");

    console.log("\nLOGIN DETAILS");
    console.log("--------------------------------");
    console.log(
      "Principal: principal@campusos.com / Admin@123"
    );
    console.log(
      "Teacher:   teacher@campusos.com / Teacher@123"
    );
    console.log(
      "Student:   student@campusos.com / Student@123"
    );
    console.log("--------------------------------");

    await mongoose.disconnect();

    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Seed error:", error);

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("Disconnect error:", disconnectError);
    }

    process.exit(1);
  }
};

seedUsers();