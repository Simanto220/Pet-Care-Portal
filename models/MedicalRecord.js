const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  nextDue: { type: Date }
});

const medicalRecordSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: { type: String, required: true },
    vaccinationRecords: [vaccinationSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
