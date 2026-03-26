/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Transpile three.js related packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
}

export default nextConfig
