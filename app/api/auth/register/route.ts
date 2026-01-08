import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, password } = await request.json();

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Get or create settings to check password
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "settings" },
      });
    }

    // Validate password
    if (password !== settings.galleryPassword) {
      return NextResponse.json(
        { error: "Invalid access password" },
        { status: 401 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Update name if user exists
      user = await prisma.user.update({
        where: { email },
        data: { firstName, lastName },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: { email, firstName, lastName },
      });
    }

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.firstName = user.firstName;
    session.lastName = user.lastName;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

