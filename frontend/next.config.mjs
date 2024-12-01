/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "niemand8080.de",
        port: '',
        pathname: '/**'
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: '',
        pathname: '/vi/**'
      },
      {
        protocol: "https",
        hostname: "192.168.7.146",
        port: '8000',
        pathname: '/api/**'
      },
    ]
  }
};

export default nextConfig;
