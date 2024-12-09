import { connect } from "@/dbConfig/db";
import User from "@/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";


connect()

export async function POST(request: NextResponse){
    try{
        const reqBody = await request.json()
        const {username, email, password} =  reqBody

        //do and handle the email, password, username requirement though handled in the user model

        console.log(reqBody);

        //check if user already exists
        const user = await User.findOne({email})
        if(user){
            return NextResponse.json({error: "User already exists"}, {status: 400})
        }

        //hash password
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        const savedUser = await newUser.save()
        console.log(savedUser);

        return NextResponse.json({
            message: "user created successfully",
            success: true,
            savedUser
        })

    }catch (error: any){
        return NextResponse.json({error: error.message},
            {status: 500}
        )
    }
}