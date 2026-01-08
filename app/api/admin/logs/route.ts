import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await prisma.loginLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
      take: 500, // Limit to last 500 logs
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Get logs error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

