import Link from "next/link";
import logo from "../assets/logo.png";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href={"/"} className="flex gap-1">
      <Image className="w-20 rounded" src={logo} alt="E"></Image>
    </Link>
  );
}
