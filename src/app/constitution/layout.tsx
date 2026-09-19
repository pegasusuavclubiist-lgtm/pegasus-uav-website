import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Constitution of P.E.G.A.S.U.S. | IIST Autonomous Systems Club",
  description:
    "Official governing document, operational guidelines, bylaws, and charter of P.E.G.A.S.U.S. UAV Club at Indian Institute of Space Science and Technology (IIST).",
};

export default function ConstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
