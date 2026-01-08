import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const flyers = await prisma.flyer.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { views: true, requests: true },
        },
      },
    });

    return NextResponse.json({ flyers });
  } catch (error) {
    console.error("Get flyers error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

