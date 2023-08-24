const mongoose=require('mongoose');

//Schema for user contents
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password: {
        type: String,
        required: true
    },
    account_activated:{
        type:Boolean,
        default:true
    },
    token_activate_account:{
        type:String
    },
    token_reset_password:{
        type:String
    },
    urlshortener:{
        
    }
})

module.exports=mongoose.model('User',userSchema)
