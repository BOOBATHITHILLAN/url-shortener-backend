require('dotenv').config()
const User=require('../models/user')
const nodemailer= require('nodemailer')


const Email_Id=process.env.Email_Id
const Email_Pass=process.env.Email_Pass

module.exports.NodeMailer= async (token,User_mail,link,res,sub)=>{

    const user= await User.findOne({email:User_mail});

    sub==="Account Activation"?user.token_activate_account=token:user.token_reset_password=token;

    const updated= await User.findByIdAndUpdate(user._id, user);    
    if(updated){
        res.status(201).json({Message:"Account activation link send to your mail id, Kindly check and activate"})
    }

     //send an email to reset/particular user  
     const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: Email_Id,
          pass: Email_Pass
        }
    });

    const sendMail = async () => {
        const info = await transporter.sendMail({
          from: `"Boobathi Thillan" <${Email_Id}>`,
          to: User_mail,
          subject: `Url Shortener ${sub} link`,
          text: link
        });
        console.log(`Mail set to ${info.messageId}`);
        return;
    };

    sendMail().catch(console.error);    
}

