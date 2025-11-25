"use client";

import { useRouter } from "next/navigation";
import { Envelope3D } from "@/components/envelope";

export default function EnvelopePage() {
  const router = useRouter();

  return <Envelope3D onOpen={() => router.push("/invitation")} />;
}
