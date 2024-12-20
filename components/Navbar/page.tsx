import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className='flex justify-center gap-x-8 items-center  p-4'>
        <Link href="/">Home</Link>
        <Link href="/city">Add City</Link>
        <Link href="/product">Add Product</Link>
    </div>
  )
}

export default page