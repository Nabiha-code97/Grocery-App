import mongoose from "mongoose";

const connectdb = async()=>{
    try{
        mongoose.connection.on('connected', ()=>console.log("DB connected successfully!"));
        await mongoose.connect(`${process.env.MONGO_URI}/greencart`);
    }catch(error){
        console.error(error.message)
    }
}
export default connectdb;