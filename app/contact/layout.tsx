import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact YIF Capital — Tanzania's digital investment platform. Get in touch for support, partnerships, or inquiries. Ohio Street, Dar es Salaam. Secure and transparent.",
  openGraph: {
    title: "Contact Us | YIF Capital",
    description: "Get in touch with YIF Capital for support, partnerships, or inquiries. Dar es Salaam, Tanzania.",
    url: "/contact",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
