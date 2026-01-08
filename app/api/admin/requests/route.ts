import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        flyer: {
          select: { id: true, code: true, title: true, imageUrl: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

