import "dotenv/config";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import School from "./models/School.js";
import Student from "./models/Student.js";
import Support from "./models/Support.js";

const FAKE_SCHOOL_COUNT = 5;
const STUDENTS_PER_SCHOOL = 20;
const GRADE_LEVELS = [
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
  "JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"
];
const SCHOOL_STATUSES = ["Active", "Inactive"];
const ENROL_POLICIES = ["open", "by-invitation"];
const COURSE_POOL = [
  { name: "Mathematics" }, { name: "English" }, { name: "Science" },
  { name: "History" }, { name: "Literature" }, { name: "Art" }, { name: "PE" }
];
const SUPPORTS_PER_STUDENT = 1; // Adjust as desired
const SUPPORTS_PER_SCHOOL = 1; // Adjust as desired

function generateFakeStudent(idx, schoolId) {
  const gender = faker.helpers.arrayElement(['male', 'female']);
  return {
    name: faker.person.fullName({ sex: gender }),
    age: faker.number.int({ min: 9, max: 20 }),
    grade: faker.helpers.arrayElement(GRADE_LEVELS),
    enrolled: faker.datatype.boolean(),
    status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'PENDING']),
    school: schoolId,
    createdAt: faker.date.past({ years: 3 }),
    updatedAt: faker.date.recent({ days: 30 }),
  };
}

function generateFakeCourses() {
  const selected = faker.helpers.arrayElements(COURSE_POOL, { min: 3, max: 5 });
  return selected.map(c => ({
    name: c.name,
    available: faker.datatype.boolean(),
  }));
}

function generateFakeSupportForStudent(studentId) {
  return {
    title: faker.lorem.sentence({ min: 2, max: 8 }),
    user: studentId,
    from: 'student',
    status: faker.helpers.arrayElement(['OPEN', 'PENDING', 'CLOSED']),
    conversation: {
      message: faker.lorem.sentence({ min: 5, max: 14 }),
      reply: faker.helpers.maybe(() => faker.lorem.sentence({ min: 3, max: 10 }), { probability: 0.75 }) || ""
    },
    createdAt: faker.date.recent({ days: 50 })
  }
}

function generateFakeSupportForSchool(schoolId) {
  return {
    title: faker.lorem.sentence({ min: 2, max: 8 }),
    user: schoolId,
    from: 'school',
    status: faker.helpers.arrayElement(['OPEN', 'PENDING', 'CLOSED']),
    conversation: {
      message: faker.lorem.sentence({ min: 5, max: 14 }),
      reply: faker.helpers.maybe(() => faker.lorem.sentence({ min: 3, max: 10 }), { probability: 0.7 }) || ""
    },
    createdAt: faker.date.recent({ days: 50 })
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clean
    await Student.deleteMany({});
    await School.deleteMany({});
    await Support.deleteMany({});
    console.log("Cleared existing schools, students, and supports.");

    // Seed Schools
    const schools = [];
    for (let i = 0; i < FAKE_SCHOOL_COUNT; ++i) {
      const schoolData = {
        name: faker.company.name() + " School",
        address: faker.location.streetAddress(),
        students: [],
        status: faker.helpers.arrayElement(SCHOOL_STATUSES),
        settings: {
          enrolmentPolicy: faker.helpers.arrayElements(ENROL_POLICIES, { min: 1, max: 2 }),
          permissions: {
            admin: faker.datatype.boolean(),
            student: true,
          },
          courses: generateFakeCourses(),
        }
      };
      schools.push(schoolData);
    }
    const createdSchools = await School.insertMany(schools);

    // Seed students for each school
    let allStudents = [];
    for (const school of createdSchools) {
      const students = [];
      for (let i = 0; i < STUDENTS_PER_SCHOOL; ++i) {
        students.push(generateFakeStudent(i, school._id));
      }
      const createdStudents = await Student.insertMany(students);

      school.students = createdStudents.map(s => s._id);
      await school.save();

      allStudents = allStudents.concat(createdStudents);
    }

    // Seed Support tickets
    const supportSeeds = [];

    // For each student, create SUPPORTS_PER_STUDENT tickets
    for (const student of allStudents) {
      for (let i = 0; i < SUPPORTS_PER_STUDENT; ++i) {
        supportSeeds.push(generateFakeSupportForStudent(student._id));
      }
    }
    // For each school, create SUPPORTS_PER_SCHOOL tickets
    for (const school of createdSchools) {
      for (let i = 0; i < SUPPORTS_PER_SCHOOL; ++i) {
        supportSeeds.push(generateFakeSupportForSchool(school._id));
      }
    }

    const createdSupports = await Support.insertMany(supportSeeds);

    console.log(`Seeded ${createdSchools.length} schools, ${allStudents.length} students, and ${createdSupports.length} supports successfully.`);
  } catch (err) {
    console.error("School, Student, or Support seed failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();
