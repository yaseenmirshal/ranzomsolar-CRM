import { Suspense } from "react";
import type { Metadata } from "next";
import { EnquiriesView } from "@/features/enquiries/enquiries-view";

export const metadata: Metadata = { title: "Enquiries" };
export default function EnquiriesPage() { return <Suspense><EnquiriesView /></Suspense>; }
