import mongoose, { model } from "mongoose";
const Schema = mongoose.Schema;

const refTokenSchema = new Schema(
  {
    refToken:{
        type: String,
        unique: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("refTokens", refTokenSchema);
