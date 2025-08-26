import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/contract_management");
        console.log("Mongo DB Connected Successfully");
    } catch (error) {
        console.error("Mongo DB Connection Error: ", error);
        process.exit(1);
    }
};

export default connectDB;