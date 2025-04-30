/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // point to your Nest backend
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};
