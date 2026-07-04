import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name:  { type: String, required: true },

  // ── Per-term scores (cwk removed) ───────────────────────
  hwk:   { type: Number, default: 0 },  // Home Work   0–10
  ca1:   { type: Number, default: 0 },  // CA1         0–10
  ca2:   { type: Number, default: 0 },  // CA2         0–10
  exam:  { type: Number, default: 0 },  // Exam        0–60
  total: { type: Number, default: 0 },  // Raw total   0–90

  // ── Carry-forward (populated on 2nd and 3rd term) ───────
  firstTermAverage:  { type: Number, default: null }, // on 2nd & 3rd term
  secondTermAverage: { type: Number, default: null }, // on 3rd term only

  grade:  { type: String },
  remark: { type: String },
});

const ratingSchema = new mongoose.Schema({
  label:  { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: null },
}, { _id: false });

const resultSchema = new mongoose.Schema(
  {
    student:  { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    term:     { type: String, required: true },
    session:  { type: String, required: true },

    // ── Subjects ──────────────────────────────────────────
    subjects:     [subjectSchema],
    totalScore:   { type: Number, default: 0 }, // sum of all subject totals (out of 90 each)
    average:      { type: Number, default: 0 }, // totalScore / numSubjects (out of 90)
    classAverage: { type: Number, default: 0 },
    gpa:          { type: Number, default: 0 },
    position:     { type: String },
    resultStatus: { type: String, default: "Pass" },
    source: {
      type:    String,
      enum:    ["direct", "aggregated"],
      default: "direct",
    },

    // ── Carry-forward term averages (for report card display) ──
    // Stored at the Result level for quick access on the report card
    firstTermAverage:  { type: Number, default: null }, // on 2nd & 3rd term result
    secondTermAverage: { type: Number, default: null }, // on 3rd term result only

    // ── Attendance ────────────────────────────────────────
    timesSchoolOpened:       { type: Number, default: 0 },
    timesPresent:            { type: Number, default: 0 },
    numberOfStudentsInClass: { type: Number, default: 0 },

    // ── Disposition Ratings ───────────────────────────────
    affectiveDispositions: {
      type: [ratingSchema],
      default: [
        { label: "Punctuality",                    rating: null },
        { label: "Neatness",                       rating: null },
        { label: "Comportment in Class",           rating: null },
        { label: "Organisation",                   rating: null },
        { label: "Promptness to Complete Work",    rating: null },
        { label: "Creativity",                     rating: null },
        { label: "Relationship with Other Pupils", rating: null },
      ],
    },

    psychomotorDispositions: {
      type: [ratingSchema],
      default: [
        { label: "Handwriting",                    rating: null },
        { label: "Games / Sports",                 rating: null },
        { label: "Handling of Learning Materials", rating: null },
        { label: "Public Speaking",                rating: null },
      ],
    },

    inclusiveLearningActivities: {
      type: [ratingSchema],
      default: [
        { label: "Practical Life Exercise", rating: null },
        { label: "Reading",                 rating: null },
        { label: "Circle Time",             rating: null },
      ],
    },

    // ── Remarks & Admin ───────────────────────────────────
    teacherRemark:  { type: String },
    headRemark:     { type: String },
    nextTermBegins: { type: String },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, term: 1, session: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);
export default Result;