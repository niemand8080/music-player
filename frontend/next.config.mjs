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
      }
    ]
  }
};

export default nextConfig;
