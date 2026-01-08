import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalFlyers,
      totalViews,
      totalRequests,
      pendingRequests,
      completedRequests,
      totalUsers,
      topFlyers,
      recentRequests,
    ] = await Promise.all([
      prisma.flyer.count(),
      prisma.flyerView.count(),
      prisma.request.count(),
      prisma.request.count({ where: { status: "PENDING" } }),
      prisma.request.count({ where: { status: "COMPLETED" } }),
      prisma.user.count(),
      prisma.flyer.findMany({
        take: 5,
        orderBy: { views: { _count: "desc" } },
        include: {
          _count: { select: { views: true, requests: true } },
        },
      }),
      prisma.request.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          flyer: { select: { code: true, title: true } },
          user: { select: { email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalFlyers,
      totalViews,
      totalRequests,
      pendingRequests,
      completedRequests,
      totalUsers,
      topFlyers,
      recentRequests,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

