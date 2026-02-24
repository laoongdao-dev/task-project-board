import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, image } = await req.json()

  const user = await prisma.user.update({
    where: {
      email: session.user.email,
    },
    data: {
      name,
      image,
    },
  })

  return NextResponse.json(user)
}
