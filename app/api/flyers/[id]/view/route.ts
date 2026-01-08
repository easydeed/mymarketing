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

    await prisma.flyerView.create({
      data: {
        flyerId: id,
        userId: session.isLoggedIn ? session.userId : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track view error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

