"use client"
import { redirect } from "next/navigation"

export default function Page() {
  redirect('/auth/login');
  return <div>Redirecting</div>
}