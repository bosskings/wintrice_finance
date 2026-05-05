import "dotenv/config";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Quiz from "./models/Quiz.js";

const FAKE_QUIZ_COUNT = 10;
const QUESTIONS_PER_QUIZ = 5;
const STUDENTS_PER_QUIZ = 10;
const STUDENT_IDS_POOL_SIZE = 40;
const ANSWER_LABELS = ['a', 'b', 'c', 'd'];

// Helper to create random questions per quiz
function generateFakeQuestion() {
  const correctIdx = faker.number.int({ min: 0, max: 3 });
  return {
    question: faker.lorem.sentence({ min: 5, max: 10 }),
    answers: {
      a: faker.lorem.word(),
      b: faker.lorem.word(),
      c: faker.lorem.word(),
      d: faker.lorem.word()
    },
    correctAnswer: ANSWER_LABELS[correctIdx]
  };
}

// Helper to create a fake quiz participant (student)
function generateFakeQuizStudent(studentId) {
  // Simulate random completion
  const isComplete = faker.datatype.boolean();
  // 50% chance to assign a completion time (in seconds), only if complete
  const completionTime = isComplete
    ? faker.number.int({ min: 60, max: QUESTIONS_PER_QUIZ * 60 }) // e.g., 1min-question to 1min/q x n
    : undefined;
  return {
    studentId,
    score: faker.number.int({ min: 0, max: QUESTIONS_PER_QUIZ }),
    completionTime,
    complete: isComplete
  };
}

// Quiz seeder function
async function seedQuiz() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clean out quiz collection
    await Quiz.deleteMany({});
    console.log("Cleared existing quizzes.");

    // Simulate a pool of fake student ObjectIds
    const fakeStudentIds = Array.from({ length: STUDENT_IDS_POOL_SIZE }, () =>
      new mongoose.Types.ObjectId()
    );

    const quizzes = [];

    for (let i = 0; i < FAKE_QUIZ_COUNT; ++i) {
      const questions = Array.from({ length: QUESTIONS_PER_QUIZ }, generateFakeQuestion);

      // Select unique students for this quiz
      const quizStudentIds = faker.helpers.arrayElements(fakeStudentIds, { min: STUDENTS_PER_QUIZ, max: STUDENTS_PER_QUIZ });
      const students = quizStudentIds.map(id => generateFakeQuizStudent(id));

      quizzes.push({
        title: faker.company.catchPhrase() + " Quiz",
        timeInMinutes: faker.number.int({ min: 20, max: 90 }),
        questions,
        students,
        dateWritten: faker.date.recent({ days: 365 })
      });
    }

    const result = await Quiz.insertMany(quizzes);

    console.log(`Seeded ${result.length} quizzes successfully.`);
  } catch (err) {
    console.error("Quiz seed failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

seedQuiz();
