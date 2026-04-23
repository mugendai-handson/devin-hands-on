import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createProjectSchema,
  generateProjectKey,
  listProjectsQuerySchema,
} from "@/lib/validations/project";

import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const parsedQuery = listProjectsQuerySchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      perPage: url.searchParams.get("perPage") ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsedQuery.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const { page, perPage } = parsedQuery.data;
    const userId = session.user.id;
    const where: Prisma.ProjectWhereInput = {
      members: { some: { userId } },
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      data: projects,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const userId = session.user.id;
    const key = parsed.data.key ?? generateProjectKey(parsed.data.name);

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        key,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
};
