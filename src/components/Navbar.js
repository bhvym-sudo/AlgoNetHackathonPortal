'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex gap-4">
        <Link href="/" className="hover:underline">Student Portal</Link>
        <Link href="/evaluator" className="hover:underline">Evaluator</Link>
        <Link href="/admin" className="hover:underline">Admin</Link>
      </div>
    </nav>
  );
}