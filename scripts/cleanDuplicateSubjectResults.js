import mongoose from "mongoose";
import dotenv from "dotenv";
import SubjectResult from "../models/subjectResultModel.js";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI is not set in environment variables.");
  process.exit(1);
}

const normalize = (value = "") => String(value).trim().toLowerCase();

const run = async () => {
  try {
    await mongoose.connect(uri, { autoIndex: false });
    console.log("Connected to MongoDB");

    const duplicates = await SubjectResult.aggregate([
      {
        $group: {
          _id: {
            student: "$student",
            normalizedSubject: "$normalizedSubject",
            normalizedClass: "$normalizedClass",
            term: "$term",
            session: "$session",
          },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (duplicates.length === 0) {
      console.log("No duplicate subject result entries found.");
      process.exit(0);
    }

    console.log(`Found ${duplicates.length} duplicate groups.`);

    let removed = 0;
    for (const dup of duplicates) {
      const [keepId, ...removeIds] = dup.ids.sort();
      const { deletedCount } = await SubjectResult.deleteMany({ _id: { $in: removeIds } });
      removed += deletedCount;
      console.log(`Group ${dup._id.student} / ${dup._id.normalizedSubject} / ${dup._id.normalizedClass} / ${dup._id.term} / ${dup._id.session}: removed ${deletedCount} duplicates`);
    }

    if (removed > 0) {
      console.log(`Successfully deleted ${removed} duplicate subject result records.`);
    }

    console.log("Cleanup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
};

run();
