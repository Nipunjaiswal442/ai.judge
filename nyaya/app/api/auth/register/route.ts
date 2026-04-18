import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import bcrypt from "bcryptjs";

// Ensure the URL is available to the Node.js runtime
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const authId = email; 

    // create the user
    await convex.mutation(api.users.createUser, {
      name,
      email,
      password: hashedPassword,
      authId,
      role: role || "LAWYER"
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
