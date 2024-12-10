import { getDataFromToken } from "src/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModels";
import { connect } from "@/dbConfig/db";

connect();

export async function GET(request: NextRequest) {
    try {
        // Extract user ID from the token
        const userID = await getDataFromToken(request);
        if (!userID) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid token" },
                { status: 401 }
            );
        }

        // Fetch the user by ID, excluding the password
        const user = await User.findOne({ _id: userID }).select("-password");
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Respond with user data
        return NextResponse.json({
            message: "User found",
            data: user,
        });
    } catch (error: any) {
        console.error("Error in /api/users/me:", error.message);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 400 }
        );
    }
}
