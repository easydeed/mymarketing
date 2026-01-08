import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: "Must be logged in to make a request" },
        { status: 401 }
      );
    }

    const { message } = await request.json();

    const flyerRequest = await prisma.request.create({
      data: {
        flyerId: id,
        userId: session.userId,
        message: message || null,
      },
    });

    return NextResponse.json({ request: flyerRequest });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

