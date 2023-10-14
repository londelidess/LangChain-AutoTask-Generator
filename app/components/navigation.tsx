'use client'

import Link from 'next/link'

// navigation
const Navigation = () => {
  return (
    <header className="border-b py-5">
      <div className="text-center">
        <Link href="/" className="font-bold text-xl cursor-pointer">
          LangChain AutoTask Generator
        </Link>
      </div>
    </header>
  )
}

export default Navigation
